import 'dotenv/config'; // Carrega as variáveis do .env
import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÕES DO SISTEMA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Verifica se o Token existe
if (!process.env.MP_ACCESS_TOKEN) {
    console.warn("⚠️ AVISO: MP_ACCESS_TOKEN não configurado no .env ou Painel!");
}

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
// Serve os arquivos estáticos (HTML, CSS, JS) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ---

// Rota de Diagnóstico
app.get("/ping", (req, res) => {
    res.send("pong 🏓");
});

// Rota para Criar Pagamento
app.post("/create-preference", async (req, res) => {
    try {
        const { description, price } = req.body;

        // 1. Validação
        if (!description || !price) {
            return res.status(400).json({ error: "Descrição e preço são obrigatórios." });
        }

        // 2. Define a URL base (Seja localhost ou raposo.tech)
        // O EasyPanel preenche a variável APP_URL automaticamente
        const baseUrl = process.env.APP_URL || `http://${req.headers.host}`;

        const preference = new Preference(client);

        // 3. Cria a preferência
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: description,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'BRL'
                    }
                ],
                // Redireciona o usuário de volta para o seu site
                back_urls: {
                    success: `${baseUrl}/`, 
                    failure: `${baseUrl}/`,
                    pending: `${baseUrl}/`
                },
                auto_return: "approved",
            }
        });

        console.log(`✅ Pagamento criado: ${description} - ${baseUrl}`);

        res.status(200).json({ 
            preference_id: result.id,
            preference_url: result.init_point
        });

    } catch (error) {
        console.error("❌ Erro Mercado Pago:", error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});

// Qualquer outra rota entrega o index.html (Útil para SPAs)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- INICIALIZAÇÃO ---
app.listen(port, () => {
    console.log(`🚀 Server Raposo.tech rodando na porta ${port}`);
});
