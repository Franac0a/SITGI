import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex max-w-xs items-center justify-center">
            <img
              src="/logo.png"
              alt="Centro de Investigación y Transferencia - CIT Formosa"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {children}

          {footer && (
            <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
