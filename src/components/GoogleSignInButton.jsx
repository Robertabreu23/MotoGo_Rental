import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onCredential, onError, disabled }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      onError?.('Falta configurar VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    let active = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!active) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredential(response.credential);
            else onError?.('Google no devolvió un ID Token válido.');
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: buttonRef.current.offsetWidth || 190,
          });
        }

        setReady(true);
      })
      .catch(() => {
        if (active) onError?.('No se pudo cargar Google Identity Services.');
      });

    return () => {
      active = false;
    };
  }, [clientId, onCredential, onError]);

  return (
    <div className={disabled || !ready ? 'pointer-events-none opacity-60' : ''}>
      <div ref={buttonRef} className="min-h-[42px] w-full flex justify-center" />
    </div>
  );
}
