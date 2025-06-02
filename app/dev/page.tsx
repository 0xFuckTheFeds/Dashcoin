import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { DashcoinButton } from "@/components/ui/dashcoin-button";

export default function MeetTheDev() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="dashcoin-title text-4xl text-dashYellow text-center">
            👋 Meet the Dev
          </h1>
          <DashcoinCard className="space-y-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/placeholder-user.jpg"
                alt="Nicholas Wenzel"
                width={160}
                height={160}
                className="rounded-full"
              />
            </div>
            <p className="dashcoin-text text-lg text-dashYellow-light">
              Hi, I’m Nicholas Wenzel — creator of Dashcoin and host of the Dashcoin Research podcast.
            </p>
            <p className="dashcoin-text text-lg text-dashYellow-light">
              I’ve been deep in crypto since 2017. What started as a simple Dune dashboard to track token fundamentals has grown into a full research hub for the Believe token ecosystem.
            </p>
            <p className="dashcoin-text text-lg text-dashYellow-light">
              I created this site to surface real alpha: calling out trends, exposing scams, and highlighting the tokens and builders actually worth paying attention to. Dashcoin is how you bet on the attention this research earns.
            </p>
            <p className="dashcoin-text text-lg text-dashYellow-light">
              When I’m not digging through on-chain data or interviewing founders, I’m building tools that make it easier to navigate the Internet Capital Markets.
            </p>
            <p className="dashcoin-text text-lg text-dashYellow-light">
              If you’re here, you’re early.
            </p>
          </DashcoinCard>
          <div className="text-center">
            <DashcoinButton asChild variant="secondary">
              <Link href="/research">Dashcoin Research Podcast</Link>
            </DashcoinButton>
          </div>
        </div>
      </main>
    </div>
  );
}
