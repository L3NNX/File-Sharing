import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto">
          
          <h1 className="
            text-3xl 
            sm:text-4xl 
            md:text-5xl 
            font-extrabold 
            mb-10 
            text-center
            tracking-tight
          ">
            About Zero Footprint Sharing
          </h1>

          <section className="
            max-w-3xl 
            mx-auto 
            space-y-6 
            text-base 
            sm:text-lg 
            leading-relaxed
          ">
            <p>
              Zero Footprint Sharing is a secure and private file sharing service
              designed to let you share files without leaving a trace. Files are
              temporary, links expire, and nothing lives longer than it should.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold pt-6">
              Key Features
            </h2>

            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Automatic Deletion:</strong> Files self-destruct after
                2 hours — no manual cleanup, no leftovers.
              </li>
              <li>
                <strong>End-to-End Encryption:</strong> Data is protected during
                upload and download.
              </li>
              <li>
                <strong>No Accounts:</strong> Share files instantly without
                sign-ups or personal data.
              </li>
              <li>
                <strong>Minimal Interface:</strong> Upload, get a link, done.
              </li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-semibold pt-6">
              How It Works
            </h2>

            <p>
              Upload a file, receive a unique download link, and share it.
              Once the time window expires, the file is permanently deleted.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold pt-6">
              Privacy First
            </h2>

            <p>
              We don’t track users, store personal data, or retain files beyond
              their lifespan. Privacy isn’t a feature — it’s the foundation.
            </p>

            <p className="pt-4">
              Thanks for using Zero Footprint Sharing.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
