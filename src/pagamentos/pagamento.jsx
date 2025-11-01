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
    const [pixChave, setPixChave] = useState("");
    const [pixImg, setPixImg] = useState("");

    const gerarPixBtn = useRef(null);

    // 🟢 Substitua pela URL real do seu servidor
    const API_BASE = "https://sevidorlojareact.onrender.com";

    // 🟡 Inicializa o SDK do Mercado Pago assim que disponível
    useEffect(() => {
        if (!mp && window.MercadoPago) {
            const mercadoPago = new window.MercadoPago(
                "TEST-8dfd781b-0e71-4c4f-9055-c2058764e646", // sua PUBLIC_KEY de teste
                { locale: "pt-BR" }
            );
            setMp(mercadoPago);
        }
    }, [mp]);

    // 🧾 Formatar número do cartão (XXXX XXXX XXXX XXXX)
    const handleNumeroCartao = (e) => {
        let val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
        setNumero(val);
    };

    // 💳 Pagamento com cartão
    const pagarCartao = async (e) => {
        e.preventDefault();
        try {
            if (!mp) return alert("❌ Mercado Pago não carregado.");

            const [ano, mes] = validade.split("-");
            if (!ano || !mes) return alert("Informe a validade corretamente.");

            // Cria token do cartão
            const tokenResponse = await mp.createCardToken({
                cardNumber: numero.replace(/\s/g, ""),
                cardExpirationMonth: mes,
                cardExpirationYear: ano,
                securityCode: cvv,
                cardholderName: nome,
            });

            const token = tokenResponse.id;

            const payer = {
                email: "test_user_123456@testuser.com",
                first_name: nome,
                identification: { type: "CPF", number: "12345678900" },
            };

            const resp = await fetch(`${API_BASE}/api/pagamento/cartao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    valor: parseFloat(valor),
                    descricao: "Compra LojaReact - Volkswagen Fox",
                    payer,
                }),
            });

            const data = await resp.json();

            if (data.status === "approved") {
                alert("✅ Pagamento com cartão aprovado!");
            } else {
                alert("❌ Erro no pagamento: " + JSON.stringify(data, null, 2));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erro ao processar pagamento com cartão.");
        }
    };

    // ⚡ Geração de QR Code PIX
    const gerarPix = async () => {
        try {
            gerarPixBtn.current.disabled = true;
            gerarPixBtn.current.textContent = "Gerando...";

            const resp = await fetch(`${API_BASE}/api/pagamento/pix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    valor: parseFloat(valor),
                    descricao: "Compra LojaReact - Volkswagen Fox",
                }),
            });

            const data = await resp.json();

            if (data.point_of_interaction?.transaction_data?.qr_code) {
                const tx = data.point_of_interaction.transaction_data;
                setPixChave(tx.qr_code);
                setPixImg("data:image/png;base64," + tx.qr_code_base64);
                alert("⚡ PIX gerado com sucesso!");
            } else if (data.qr_code) {
                setPixChave(data.qr_code);
                setPixImg(data.qr_code_base64 ? "data:image/png;base64," + data.qr_code_base64 : "");
                alert("⚡ PIX gerado com sucesso!");
            } else {
                alert("❌ Erro ao gerar PIX: " + JSON.stringify(data, null, 2));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erro ao gerar PIX.");
        } finally {
            gerarPixBtn.current.disabled = false;
            gerarPixBtn.current.textContent = "Gerar QR PIX";
        }
    };

    // 📋 Copiar chave PIX
    const copiarChave = () => {
        if (!pixChave) return alert("Nenhuma chave PIX para copiar.");
        navigator.clipboard.writeText(pixChave);
        alert("📋 Chave PIX copiada!");
    };

    return (
        <div className="container">
            <h2>
                <i className="fa fa-lock"></i> Pagamento Seguro
            </h2>

            {/* Escolher método */}
            <div className="pagamento-tipo">
                <label>
                    <input
                        type="radio"
                        name="tipo"
                        value="cartao"
                        checked={tipo === "cartao"}
                        onChange={() => setTipo("cartao")}
                    />
                    <i className="fa fa-credit-card"></i> Cartão
                </label>
                <label>
                    <input
                        type="radio"
                        name="tipo"
                        value="pix"
                        checked={tipo === "pix"}
                        onChange={() => setTipo("pix")}
                    />
                    <i className="fa fa-qrcode"></i> PIX
                </label>
            </div>

            {/* 💳 Cartão */}
            {tipo === "cartao" && (
                <form className="cartao-info ativo" onSubmit={pagarCartao}>
                    <label htmlFor="nome-cartao">Nome no Cartão</label>
                    <input
                        id="nome-cartao"
                        type="text"
                        placeholder="Ex: Maria Souza"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

                    <label htmlFor="numero-cartao">Número do Cartão</label>
                    <input
                        id="numero-cartao"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        value={numero}
                        onChange={handleNumeroCartao}
                        required
                    />

                    <div className="row">
                        <div className="half">
                            <label htmlFor="validade">Validade</label>
                            <input
                                id="validade"
                                type="month"
                                value={validade}
                                onChange={(e) => setValidade(e.target.value)}
                                required
                            />
                        </div>
                        <div className="half">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                id="cvv"
                                type="text"
                                placeholder="123"
                                maxLength="4"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <input
                        id="valor-cartao"
                        type="number"
                        placeholder="Valor (R$)"
                        value={valor}
                        step="0.01"
                        onChange={(e) => setValor(e.target.value)}
                        required
                    />

                    <button type="submit" className="botao">
                        Pagar com Cartão
                    </button>
                </form>
            )}

            {/* ⚡ PIX */}
            {tipo === "pix" && (
                <div className="pix-info ativo">
                    <p style={{ textAlign: "center" }}>Escaneie o QR ou copie a chave</p>
                    {pixChave && <div className="info">{pixChave}</div>}
                    {pixImg && <img className="qr-img" src={pixImg} alt="QR Code PIX" />}
                    <button onClick={copiarChave} className="botao" style={{ marginTop: 8 }}>
                        Copiar Chave PIX
                    </button>
                    <button ref={gerarPixBtn} onClick={gerarPix} className="botao green" style={{ marginTop: 8 }}>
                        Gerar QR PIX
                    </button>
                </div>
            )}

            <a href="/" className="voltar">
                <i className="fa fa-arrow-left"></i> Voltar à loja
            </a>
        </div>
    );
}

export default Pagamento;
