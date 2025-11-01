// Pagamento.jsx
import React, { useState, useRef, useEffect } from "react";
import "./pagamento.css";

function Pagamento() {
    const [mp, setMp] = useState(null);
    const [tipo, setTipo] = useState("cartao");
    const [valor, setValor] = useState(20);

    // Cartão
    const [numero, setNumero] = useState("");
    const [rawNumero, setRawNumero] = useState("");
    const [validade, setValidade] = useState("");
    const [cvv, setCvv] = useState("");
    const [paymentMethodId, setPaymentMethodId] = useState("visa");

    // PIX
    const [pixChave, setPixChave] = useState("");
    const [pixImg, setPixImg] = useState("");
    const gerarPixBtn = useRef(null);

    const API_BASE = "https://sevidorlojareact.onrender.com";

    useEffect(() => {
        if (!mp && window.MercadoPago) {
            const mercadoPago = new window.MercadoPago(
                "TEST-8dfd781b-0e71-4c4f-9055-c2058764e646",
                { locale: "pt-BR" }
            );
            setMp(mercadoPago);
        }
    }, [mp]);

    const formatWithSpaces = (digits) => digits.replace(/(.{4})/g, "$1 ").trim();
    const handleNumeroCartao = (e) => {
        const digits = e.target.value.replace(/\D/g, "");
        setRawNumero(digits);
        setNumero(formatWithSpaces(digits));
    };

    const preencherCartaoTeste = (tipoCartao) => {
        const cards = {
            visa: { numero: "4509953566233704", validade: "2030-11", cvv: "123", valor: 20 },
            mastercard: { numero: "5031755734530604", validade: "2030-11", cvv: "123", valor: 20 },
            amex: { numero: "371111111111111", validade: "2030-11", cvv: "1234", valor: 20 },
        };
        const c = cards[tipoCartao];
        if (!c) return;
        setRawNumero(c.numero);
        setNumero(formatWithSpaces(c.numero));
        setValidade(c.validade);
        setCvv(c.cvv);
        setValor(c.valor);
        setPaymentMethodId(tipoCartao); // define payment_method_id
    };

    const createCardTokenWithFallback = async (cardPayload) => {
        try { return await mp.createCardToken(cardPayload); }
        catch (err) {
            const payload2 = { ...cardPayload };
            if (String(cardPayload.cardExpirationYear).length === 4) {
                payload2.cardExpirationYear = String(cardPayload.cardExpirationYear).slice(-2);
            }
            return await mp.createCardToken(payload2);
        }
    };

    const pagarCartao = async (e) => {
        e.preventDefault();
        if (!mp || !rawNumero || !validade || !cvv) return alert("Preencha todos os campos.");

        const [ano, mes] = validade.split("-");
        const cardPayload = {
            cardNumber: rawNumero,
            cardExpirationMonth: mes,
            cardExpirationYear: ano,
            securityCode: cvv,
            cardholderName: "Test User",
        };

        try {
            const tokenResp = await createCardTokenWithFallback(cardPayload);
            if (!tokenResp.id) return alert("Erro ao gerar token.");

            const payer = {
                email: "test_user_19653790@testuser.com",
                identification: { type: "CPF", number: "19119119100" },
            };

            const payloadBackend = {
                token: tokenResp.id,
                valor: parseFloat(valor),
                descricao: "Compra LojaReact - Volkswagen Fox",
                payer,
                payment_method_id: paymentMethodId,
            };

            const resp = await fetch(`${API_BASE}/api/pagamento/cartao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadBackend),
            });

            const data = await resp.json();
            if (data.status === "approved") alert("✅ Pagamento aprovado!");
            else alert("❌ Pagamento não aprovado. Veja console.");
        } catch (err) { console.error(err); alert("Erro ao processar pagamento."); }
    };

    const gerarPix = async () => {
        try {
            gerarPixBtn.current.disabled = true;
            gerarPixBtn.current.textContent = "Gerando...";
            const resp = await fetch(`${API_BASE}/api/pagamento/pix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ valor: parseFloat(valor), descricao: "Compra LojaReact - Volkswagen Fox" }),
            });
            const data = await resp.json();
            const tx = data.data.point_of_interaction?.transaction_data;
            if (tx?.qr_code) {
                setPixChave(tx.qr_code);
                setPixImg("data:image/png;base64," + tx.qr_code_base64);
                alert("⚡ PIX gerado!");
            }
        } catch (err) { console.error(err); alert("Erro ao gerar PIX."); }
        finally { gerarPixBtn.current.disabled = false; gerarPixBtn.current.textContent = "Gerar QR PIX"; }
    };

    const copiarChave = () => { if (pixChave) navigator.clipboard.writeText(pixChave) && alert("Chave PIX copiada!"); };

    return (
        <div className="container">
            <h2>Pagamento Seguro</h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={() => preencherCartaoTeste("visa")}>Visa Teste</button>
                <button onClick={() => preencherCartaoTeste("mastercard")}>Mastercard Teste</button>
                <button onClick={() => preencherCartaoTeste("amex")}>Amex Teste</button>
                <button onClick={() => { setNumero(""); setRawNumero(""); setValidade(""); setCvv(""); setValor(20); }}>Limpar</button>
            </div>

            <div className="pagamento-tipo">
                <label><input type="radio" value="cartao" checked={tipo === "cartao"} onChange={() => setTipo("cartao")} /> Cartão</label>
                <label><input type="radio" value="pix" checked={tipo === "pix"} onChange={() => setTipo("pix")} /> PIX</label>
            </div>

            {tipo === "cartao" && (
                <form onSubmit={pagarCartao}>
                    <input type="text" placeholder="0000 0000 0000 0000" value={numero} onChange={handleNumeroCartao} required />
                    <input type="month" value={validade} onChange={e => setValidade(e.target.value)} required />
                    <input type="text" placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} required />
                    <input type="number" value={valor} onChange={e => setValor(e.target.value)} required />
                    <button type="submit">Pagar com Cartão</button>
                </form>
            )}

            {tipo === "pix" && (
                <div>
                    {pixChave && <div>{pixChave}</div>}
                    {pixImg && <img src={pixImg} alt="QR PIX" />}
                    <button ref={gerarPixBtn} onClick={gerarPix}>Gerar QR PIX</button>
                    <button onClick={copiarChave}>Copiar Chave PIX</button>
                </div>
            )}
        </div>
    );
}

export default Pagamento;
