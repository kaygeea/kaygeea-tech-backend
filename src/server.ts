import dotenv from "dotenv";
import app from "./app.js";
import UnexpectedError from "./utils/customErrors/unexpected.error.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

// Start the server.
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    throw new UnexpectedError(
      "Error during server startup",
      error as Error,
      "startServer()",
    );
  }
};

startServer();
