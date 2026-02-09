import { useCallback, useState } from "react";
import axiosInstance from "../utils/network";
import { useSetAccessToken } from "../hooks/accessToken";
import { useUser } from "../hooks/user";
import Loader from "./Loader";
import { GOOGLE_CLIENT_ID } from "../config";

declare global {
  interface Window {
    google: typeof google;
  }

  const google: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "small" | "medium" | "large";
            shape?: "rectangular" | "pill" | "circle";
          },
        ) => void;
        cancel: () => void;
        prompt?: () => void;
      };
    };
  };
}

function SignInComponent() {
  const [loading, setLoading] = useState(false);
  const setAccessToken = useSetAccessToken();
  const [user, setUser] = useUser();

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setLoading(true);

      try {
        const res = await axiosInstance.post("v1/login", {
          googleJWT: response.credential,
        });
        const { accessToken, userId } = res.data;
        setAccessToken(accessToken);
        setUser((prev) => ({ ...prev, userId, loggedIn: true }));
      } catch (er) {
        console.log(er);
      } finally {
        setLoading(false);
      }
    },
    [setAccessToken, setUser],
  );

  const initializeGoogle = useCallback(
    (node: HTMLDivElement | null) => {
      console.log("testing", node);
      if (node) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(node, {
          theme: "outline",
          size: "medium",
          shape: "pill",
        });
      } else {
        google.accounts.id.cancel();
      }
    },
    [handleCredentialResponse],
  );

  return (
    <>
      {!loading ? (
        !user.loggedIn && <div ref={initializeGoogle} id="buttonDiv"></div>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default SignInComponent;
