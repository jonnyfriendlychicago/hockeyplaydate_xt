// app/not-found.tsx

'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home,  ArrowLeft , AlertTriangle } from 'lucide-react';
import { CopyText } from '@/components/shared/copyText';
import Footer from '@/components/footer'; 
import Header from '@/components/NotFound/Header';

const supportEmailAddy = 'support@hockeyplaydate.com' // easily changed variable in case we ever want to swap out the HPD email addy

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col"> 
        <Header />
        <main className="flex-1 wrapper flex flex-col items-center justify-center"> 
          {/* Main Content Card */}
          <div className="w-full max-w-md mx-auto bg-card border rounded-lg shadow-sm p-8 text-center">
            <div className='flex justify-center' >
            <AlertTriangle className="h-40 w-40 text-yellow-500 mb-8" />
            </div>
            {/* Heading */}
            <h1 className="text-2xl font-semibold mb-3 text-foreground">
              Page Not Found
            </h1>
            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Sorry, we couldn&apos;t find this page.
            </p>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/" className="inline-flex items-center gap-2">
                  <Home size={16} />
                  Go Home
                </Link>
              </Button>
              <Button 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
              >
                <ArrowLeft size={16} />
                Go Back
              </Button>
            </div>
            <p className="text-muted-foreground mt-8 leading-relaxed">
              If you think this is an error or you have questions, please email us:
              </p>
            <div className="flex items-center justify-center gap-1 mx-auto  text-blue-800 px-3 py-1 rounded text-sm">
              <span className="font-mono">{supportEmailAddy}</span>
              <CopyText text={supportEmailAddy} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};
