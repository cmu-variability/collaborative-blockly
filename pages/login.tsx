import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import { FaPuzzlePiece, FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { signIn, signInWithGoogle, auth } from "../lib/firebase";
import { getRedirectResult, AuthErrorCodes } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle redirect result from Google Sign-in
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        // Show loading state during redirect result check
        setLoading(true);

        // Get the redirect result
        const result = await getRedirectResult(auth);

        if (result?.user) {
          // User successfully signed in with Google redirect
          router.push("/dashboard");
        }
      } catch (error: any) {
        console.error("Error processing redirect result:", error);
        if (error.code !== AuthErrorCodes.NULL_USER) {
          // Only show errors that aren't due to no redirect result
          setError(error.message || "An error occurred during Google sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    checkRedirectResult();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to dashboard on successful login
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      // Note: The redirect will happen automatically, no need to navigate here
      // The result will be handled in the useEffect hook on return from redirect
    } catch (error: any) {
      setError(error.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Head>
        <title>Login | BlocklyCollab</title>
        <meta
          name="description"
          content="Login to BlocklyCollab - Collaborative programming for autistic youth"
        />
      </Head>

      <div className={styles.authFormContainer}>
        <div className={styles.authHeader}>
          <Link href="/" className={`${styles.logoLink} ${styles.logo}`}>
            <FaPuzzlePiece className={styles.logoIcon} />
            <span>BlocklyCollab</span>
          </Link>
          <h1 className={styles.authTitle}>Log in to your account</h1>
          <p className={styles.authSubtitle}>
            Welcome back! Please enter your credentials to access your
            workspace.
          </p>
        </div>

        <div className={styles.authForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className={styles.googleButton}
            disabled={loading}
          >
            <FaGoogle className={styles.googleIcon} />
            Sign in with Google
          </button>

          <div className={styles.authFooter}>
            Don't have an account?{" "}
            <Link href="/signup" className={styles.authLink}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
