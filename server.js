import 'dotenv/config'; 
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
// Serve os arquivos da pasta 'public' (Onde está seu index.html)
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ---

app.get("/ping", (req, res) => {
    res.send("pong 🏓 Raposo.tech Online");
});

app.post("/create-preference", async (req, res) => {
    try {
        const { description, price } = req.body;

        if (!description || !price) {
            return res.status(400).json({ error: "Descrição e preço são obrigatórios." });
        }

        // LÓGICA DE DOMÍNIO AUTOMÁTICA
        // Se a var APP_URL existir (EasyPanel), usa ela. Senão, usa o host da requisição.
        let baseUrl = process.env.APP_URL; 
        
        if (!baseUrl) {
            // Fallback para localhost ou IP local se não tiver variável configurada
            const protocol = req.secure ? 'https' : 'http';
            baseUrl = `${protocol}://${req.headers.host}`;
        }
        
        // Remove barra no final se tiver, para não duplicar na montagem
        baseUrl = baseUrl.replace(/\/$/, "");

        const preference = new Preference(client);

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
                back_urls: {
                    success: `${baseUrl}/`, 
                    failure: `${baseUrl}/`,
                    pending: `${baseUrl}/`
                },
                auto_return: "approved",
            }
        });

        console.log(`✅ Checkout Criado: ${description} | Retorno para: ${baseUrl}`);

        res.status(200).json({ 
            preference_id: result.id,
            preference_url: result.init_point
        });

    } catch (error) {
        console.error("❌ Erro Mercado Pago:", error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});

// Qualquer rota desconhecida entrega o site
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START ---
app.listen(port, () => {
    console.log(`🚀 Server rodando na porta ${port}`);
});
