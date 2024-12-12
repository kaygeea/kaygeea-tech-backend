import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

// Start the server.
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    throw new Error("Error during server startup", { cause: error });
  }
};

startServer();
