import React, { useState, useRef, useEffect } from "react";
import "./pagamento.css";

function Pagamento() {
    const [mp, setMp] = useState(null);
    const [tipo, setTipo] = useState("cartao");
    const [valor, setValor] = useState(20);
    const [nome, setNome] = useState("");
    const [numero, setNumero] = useState("");
    const [validade, setValidade] = useState("");
    const [cvv, setCvv] = useState("");
    const [pixChave, setPixChave] = useState("Carregando...");
    const [pixImg, setPixImg] = useState("");

    const gerarPixBtn = useRef(null);
    const copiarBtn = useRef(null);

    const API_BASE = "http://localhost:3000/api/pagamento";

    // Inicializar SDK Mercado Pago
    useEffect(() => {
        if (!mp && window.MercadoPago) {
            const mercadoPago = new window.MercadoPago("SUA_PUBLIC_KEY", {
                locale: "pt-BR",
            });
            setMp(mercadoPago);
        }
    }, [mp]);

    // Formatar número do cartão
    const handleNumeroCartao = (e) => {
        let val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
        setNumero(val);
    };

    // Enviar pagamento com cartão (gera token no frontend)
    const pagarCartao = async (e) => {
        e.preventDefault();
        try {
            if (!mp) return alert("Mercado Pago não carregado.");

            const cardData = {
                cardNumber: numero.replace(/\s/g, ""),
                cardExpirationMonth: validade.split("-")[1],
                cardExpirationYear: validade.split("-")[0],
                securityCode: cvv,
                cardholderName: nome,
            };

            const tokenResponse = await mp.createCardToken(cardData);
            const token = tokenResponse.id;

            const payer = {
                email: "test_user_123456@testuser.com",
                first_name: nome,
                identification: { type: "CPF", number: "12345678900" },
            };

            const resp = await fetch(`${API_BASE}/cartao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, valor, descricao: "Compra LojaScript - Volkswagen Fox", payer }),
            });

            const data = await resp.json();

            if (data.status === "approved") {
                alert("✅ Pagamento com cartão aprovado!");
            } else {
                alert("❌ Erro no pagamento: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erro ao processar pagamento com cartão.");
        }
    };

    // Gerar PIX
    const gerarPix = async () => {
        try {
            gerarPixBtn.current.disabled = true;
            gerarPixBtn.current.textContent = "Gerando...";
            const resp = await fetch(`${API_BASE}/pix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ valor, descricao: "Compra LojaScript - Volkswagen Fox" }),
            });

            const data = await resp.json();

            if (data.status === "approved" || data.qr_code) {
                setPixChave(data.point_of_interaction?.transaction_data?.qr_code || data.qr_code);
                setPixImg(
                    data.point_of_interaction?.transaction_data?.qr_code_base64
                        ? "data:image/png;base64," + data.point_of_interaction.transaction_data.qr_code_base64
                        : ""
                );
                alert("⚡ PIX gerado com sucesso!");
            } else {
                alert("❌ Erro ao gerar PIX: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erro ao gerar PIX.");
        } finally {
            gerarPixBtn.current.disabled = false;
            gerarPixBtn.current.textContent = "Gerar QR PIX";
        }
    };

    const copiarChave = () => {
        navigator.clipboard.writeText(pixChave);
        alert("📋 Chave PIX copiada!");
    };

    return (
        <div className="container">
            <h2>
                <i className="fa fa-lock"></i> Pagamento Seguro
            </h2>

            <div className="pagamento-tipo">
                <label>
                    <input type="radio" name="tipo" value="cartao" checked={tipo === "cartao"} onChange={() => setTipo("cartao")} />
                    <i className="fa fa-credit-card"></i> Cartão
                </label>
                <label>
                    <input type="radio" name="tipo" value="pix" checked={tipo === "pix"} onChange={() => setTipo("pix")} />
                    <i className="fa fa-qrcode"></i> PIX
                </label>
            </div>

            {/* CARTÃO */}
            {tipo === "cartao" && (
                <form className="cartao-info ativo" onSubmit={pagarCartao}>
                    <label htmlFor="nome-cartao">Nome no Cartão</label>
                    <input id="nome-cartao" type="text" placeholder="Ex: Maria Souza" value={nome} onChange={(e) => setNome(e.target.value)} required />

                    <label htmlFor="numero-cartao">Número do Cartão</label>
                    <input id="numero-cartao" type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={numero} onChange={handleNumeroCartao} required />

                    <div className="row">
                        <div className="half">
                            <label htmlFor="validade">Validade</label>
                            <input id="validade" type="month" value={validade} onChange={(e) => setValidade(e.target.value)} required />
                        </div>
                        <div className="half">
                            <label htmlFor="cvv">CVV</label>
                            <input id="cvv" type="text" placeholder="123" maxLength="4" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
                        </div>
                    </div>

                    <input id="valor-cartao" type="number" placeholder="Valor (R$)" value={valor} step="0.01" onChange={(e) => setValor(e.target.value)} required />

                    <button type="submit" className="botao">Pagar com Cartão</button>
                </form>
            )}

            {/* PIX */}
            {tipo === "pix" && (
                <div className="pix-info ativo">
                    <p style={{ textAlign: "center" }}>Escaneie o QR ou copie a chave</p>
                    <div className="info">{pixChave}</div>
                    {pixImg && <img className="qr-img" src={pixImg} alt="QR Code PIX" />}
                    <button ref={copiarBtn} onClick={copiarChave} className="botao" style={{ marginTop: 8 }}>Copiar Chave PIX</button>
                    <button ref={gerarPixBtn} onClick={gerarPix} className="botao green" style={{ marginTop: 8 }}>Gerar QR PIX</button>
                </div>
            )}

            <a href="/" className="voltar">
                <i className="fa fa-arrow-left"></i> Voltar à loja
            </a>
        </div>
    );
}

export default Pagamento;
