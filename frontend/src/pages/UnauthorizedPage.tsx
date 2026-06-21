import { useNavigate } from "react-router-dom";
import { Button, Heading, Text } from "../components/primitive";
import "./global-pages.css";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <main className="page page-unauthorized">
      <div className="page__content page-unauthorized__content">
        <Heading level="banner" className="page-unauthorized__title">
          Unauthorized
        </Heading>
        <Text className="page-unauthorized__message">
          You need to sign in before you can open Chat.
        </Text>
        <div className="page-unauthorized__actions">
          <Button
            variant="primary"
            type="button"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
          <Button
            variant="secondary"
            narrow
            type="button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </main>
  );
}
