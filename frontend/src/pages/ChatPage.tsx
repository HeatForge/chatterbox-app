import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Heading, Text } from "../components/primitive";
import "./global-pages.css";

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleSignOut() {
    await logout();
    navigate("/signin", { replace: true });
  }

  return (
    <main className="page page-chat">
      <div className="page__content page-chat__content">
        <Heading level="banner" className="page-chat__title">
          Chat
        </Heading>
        <section className="page-chat__panel">
          <Text className="page-chat__greeting">
            Welcome, {user?.displayName ?? "friend"}.
          </Text>
          <Text>
            This is a demo chat space. Messages, channels, and live updates will
            land here once the messaging features are built out.
          </Text>
          <Text>
            For now, imagine this panel filled with conversations, typing
            indicators, and the gentle hum of a working product.
          </Text>
        </section>
        <Button variant="secondary" narrow type="button" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </main>
  );
}
