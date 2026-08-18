import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "SirGRAMS API is running!"
    });
});

app.listen(PORT, () => {
    console.log(`SirGRAMS API running on http://localhost:${PORT}`);
});