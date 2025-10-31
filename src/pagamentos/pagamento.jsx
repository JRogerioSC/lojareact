import React, { useState } from 'react'
import './pagamento.css'

function Pagamento() {
    const [tipo, setTipo] = useState('cartao')
    const [nome, setNome] = useState('')
    const [numero, setNumero] = useState('')
    const [validade, setValidade] = useState('')
    const [cvv, setCvv] = useState('')
    const [valor, setValor] = useState(20)
    const [pixChave, setPixChave] = useState('Carregando...')
    const [pixQr, setPixQr] = useState('')
    const [gerando, setGerando] = useState(false)

    const API_BASE = 'http://localhost:3000/api/pagamento'

    // Máscara número do cartão
    const handleNumero = (e) => {
        let v = e.target.value.replace(/\D/g, '')
        v = v.replace(/(.{4})/g, '$1 ').trim()
        setNumero(v)
    }

    // Envio do cartão
    const enviarCartao = async (e) => {
        e.preventDefault()
        try {
            const resp = await fetch(`${API_BASE}/cartao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, numero, validade, cvv, valor }),
            })
            const data = await resp.json()
            if (data.status === 'ok') {
                alert('✅ Pagamento com cartão processado (sandbox). ID: ' + data.id)
            } else {
                alert('❌ Erro no cartão: ' + (data.error || JSON.stringify(data)))
            }
        } catch (err) {
            console.error(err)
            alert('❌ Erro ao comunicar com o servidor.')
        }
    }

    // Geração PIX
    const gerarPix = async () => {
        try {
            setGerando(true)
            const resp = await fetch(`${API_BASE}/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: 20.0, descricao: 'Compra LojaScript - Volkswagen Fox' }),
            })
            const data = await resp.json()

            if (data.status === 'ok') {
                if (data.qr_code_base64) {
                    setPixQr('data:image/png;base64,' + data.qr_code_base64)
                }
                setPixChave(data.qr_code || 'Chave PIX indisponível')
                alert('⚡ PIX gerado com sucesso!')
            } else {
                alert('Erro ao gerar PIX: ' + (data.error || JSON.stringify(data)))
            }
        } catch (err) {
            console.error(err)
            alert('❌ Erro ao gerar PIX no servidor.')
        } finally {
            setGerando(false)
        }
    }

    const copiarChave = () => {
        navigator.clipboard.writeText(pixChave)
        alert('📋 Chave PIX copiada!')
    }

    return (
        <div className="container">
            <h2>🔒 Pagamento Seguro</h2>

            <div className="pagamento-tipo">
                <label>
                    <input
                        type="radio"
                        name="tipo"
                        value="cartao"
                        checked={tipo === 'cartao'}
                        onChange={() => setTipo('cartao')}
                    />{' '}
                    💳 Cartão
                </label>
                <label>
                    <input
                        type="radio"
                        name="tipo"
                        value="pix"
                        checked={tipo === 'pix'}
                        onChange={() => setTipo('pix')}
                    />{' '}
                    ⚡ PIX
                </label>
            </div>

            {/* Cartão */}
            {tipo === 'cartao' && (
                <form className="cartao-info" onSubmit={enviarCartao}>
                    <label>Nome no Cartão</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Souza"
                        required
                    />

                    <label>Número do Cartão</label>
                    <input
                        type="text"
                        value={numero}
                        onChange={handleNumero}
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        required
                    />

                    <div className="row">
                        <div className="half">
                            <label>Validade</label>
                            <input
                                type="month"
                                value={validade}
                                onChange={(e) => setValidade(e.target.value)}
                                required
                            />
                        </div>
                        <div className="half">
                            <label>CVV</label>
                            <input
                                type="text"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="123"
                                maxLength="4"
                                required
                            />
                        </div>
                    </div>

                    <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="Valor (R$)"
                        step="0.01"
                        required
                    />

                    <button type="submit" className="botao">
                        Pagar com Cartão
                    </button>
                </form>
            )}

            {/* PIX */}
            {tipo === 'pix' && (
                <div className="pix-info">
                    <p style={{ textAlign: 'center' }}>Escaneie o QR ou copie a chave</p>
                    <div className="info">{pixChave}</div>
                    {pixQr && <img className="qr-img" src={pixQr} alt="QR Code PIX" />}
                    <button className="botao" onClick={copiarChave}>
                        Copiar Chave PIX
                    </button>
                    <button className="botao green" onClick={gerarPix} disabled={gerando}>
                        {gerando ? 'Gerando...' : 'Gerar QR PIX'}
                    </button>
                </div>
            )}

            <a href="/" className="voltar">
                ← Voltar à loja
            </a>
        </div>
    )
}

export default Pagamento