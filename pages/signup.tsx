import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import { FaPuzzlePiece, FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import {
  signUp,
  signInWithGoogle,
  auth,
  updateUserProfile,
} from "../lib/firebase";
import { getRedirectResult, AuthErrorCodes } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
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
          // If user signed in with Google, collect additional information
          if (!result.user.displayName) {
            // Stay on this page to collect info
            setLoading(false);
            return;
          }
          // User successfully signed in with Google redirect and has name
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await signUp(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Update user profile with name and school
      await updateUserProfile({
        displayName: name,
        photoURL: null,
      });

      // Store school info in Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              name,
              school,
              email: user.email,
              createdAt: Timestamp.now(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.error("Error storing additional user data:", err);
      }

      // Redirect to dashboard on successful signup
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
        <title>Sign Up | BlocklyCollab</title>
        <meta
          name="description"
          content="Sign up for BlocklyCollab - Collaborative programming for autistic youth"
        />
      </Head>

      <div className={styles.authFormContainer}>
        <div className={styles.authHeader}>
          <Link href="/" className={`${styles.logoLink} ${styles.logo}`}>
            <FaPuzzlePiece className={styles.logoIcon} />
            <span>BlocklyCollab</span>
          </Link>
          <h1>Sign Up</h1>
          <p>Create your account to get started</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSignUp}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="school">School (Optional)</label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Enter your school name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password (6+ characters)"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className={styles.googleButton}
          disabled={loading}
        >
          <FaGoogle className={styles.googleIcon} />
          Continue with Google
        </button>

        <div className={styles.authFooter}>
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
