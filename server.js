import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para caminhos no ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Serve os arquivos da pasta public (seu site HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Pega o Token das Variáveis de Ambiente (Configurado no EasyPanel)
const accessToken = process.env.MP_ACCESS_TOKEN;
const client = new MercadoPagoConfig({ accessToken: accessToken });

app.post("/create-preference", async (req, res) => {
    try {
        const { description, price } = req.body;
        
        // No Docker, pegamos o domínio atual automaticamente ou usamos variável
        // Se o host não estiver definido, fallback para localhost (teste local)
        const host = process.env.APP_URL || 'http://localhost:8080';

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
                    success: `${host}/feedback`, // Você pode criar essa rota depois
                    failure: `${host}/`,
                    pending: `${host}/`
                },
                auto_return: "approved",
            }
        });

        res.status(200).json({ 
            preference_id: result.id,
            preference_url: result.init_point
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar preferência' });
    }
});

// O EasyPanel/Docker injeta a porta na variável PORT, ou usa 8080
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server rodando na porta ${port}`);
});