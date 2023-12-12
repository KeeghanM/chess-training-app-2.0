"use client";
import StyledLink from "../_elements/styledLink";
import Button from "../_elements/button";
import Heading from "../_elements/heading";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import trackEventOnClient from "~/app/_util/trackEventOnClient";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const posthog = usePostHog();
  const [parent] = useAutoAnimate();

  useEffect(() => {
    if (
      !(posthog.has_opted_in_capturing() || posthog.has_opted_out_capturing())
    ) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  const acceptCookies = async () => {
    await trackEventOnClient("cookie_opt_in", {});
    posthog.opt_in_capturing();
    setShowBanner(false);
  };

  const declineCookies = async () => {
    await trackEventOnClient("cookie_opt_out", {});
    posthog.opt_out_capturing();
    setShowBanner(false);
  };

  return (
    <>
      <div className="fixed z-[5000] inset-0 grid place-items-center">
        <div
          onClick={acceptCookies}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] "
        ></div>
        <div className="p-4 z-[9999] md:p-6 lg:px-24 text-sm text-white shadow-md bg-slate-800 w-[850px] max-w-[90vw] max-h-[90vh] flex flex-col gap-4 items-center">
          <Heading as="h3">
            We're all about the 🍪cookies🍪, but only the good kind! 🎉
          </Heading>
          <div
            className="overflow-y-scroll flex flex-col gap-2 items-center"
            ref={parent}
          >
            <p>
              Here at ChessTraining.app, our cookie use is all about making your
              experience better, not about ads. We use cookies solely for
              understanding how you engage with our site - think of it as our
              way of learning the moves you make so we can improve our game (and
              yours!).
            </p>
            {!readMore && (
              <p
                className="text-sm underline cursor-pointer text-orange-500"
                onClick={() => setReadMore(true)}
              >
                Read More
              </p>
            )}
            {readMore && (
              <>
                <p>
                  Our trusty sidekick in this endeavor is PostHog, a product
                  analytics platform. It helps us track events like
                  'course_started' and 'course_created', ensuring we're always
                  on top of our training game. And don't worry, there's no
                  Google Analytics or hidden ad trackers here.
                </p>
                <p>
                  Curious about the details? Check out our{" "}
                  <StyledLink href="privacy-policy" text="privacy policy" /> for
                  the full rundown. Your privacy is our priority, and we're
                  committed to being transparent and responsible with your data.
                  So, let's enjoy a cookie-filled (data-wise!) journey to chess
                  mastery, with no unexpected ads!
                </p>
                <p
                  className="text-sm underline cursor-pointer text-orange-500"
                  onClick={() => setReadMore(false)}
                >
                  Hide
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="success" onClick={acceptCookies}>
              Accept cookies
            </Button>
            <Button variant="danger" onClick={declineCookies}>
              Decline cookies
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
