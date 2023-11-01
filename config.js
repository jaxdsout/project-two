const DATABASE_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cmcdhij.mongodb.net/qwiklok?retryWrites=true&w=majority`;

const PORT = process.env.PORT || 8080;

const JWT_KEY_SECRET = process.env.JWT_KEY_SECRET;

module.exports = { DATABASE_URL, PORT, JWT_KEY_SECRET };