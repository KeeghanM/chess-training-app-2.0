'use client';

import { useEffect, useState } from 'react';

import Button from '../../_elements/button';
import Heading from '../../_elements/heading';
import StyledLink from '../../_elements/styledLink';

export default function BetaMessage() {
  const [show, setShow] = useState(false);

  const close = () => {
    // set a local storage item to prevent this from showing again
    localStorage.setItem('beta-message', 'true');
    setShow(false);
  };

  useEffect(() => {
    const betaMessage = localStorage.getItem('beta-message');
    if (!betaMessage) setShow(true);
  }, []);

  return (
    show && (
      <>
        <div
          className="fixed inset-0 z-[9999] bg-black opacity-30"
          onClick={close}
        />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-2">
          <div className="flex max-h-[80vh] max-w-screen-sm flex-col gap-2 overflow-y-auto bg-white p-2 md:p-4">
            <Heading as="h2">Welcome to the beta!</Heading>
            <p>
              This is a public beta, or trial, of the Course Trainer feature.
              While it should be fairly close to the final product, there may be
              bugs or other issues. If you find any, please{' '}
              <StyledLink href="/contact/report-an-issue">
                report them to us
              </StyledLink>
              .
            </p>
            <p>
              To get started, you will need a PGN that you want to train. Or,
              you can check out either our{' '}
              <StyledLink href="/courses/public-beta-petroff">
                Petroff
              </StyledLink>{' '}
              or{' '}
              <StyledLink href="/courses/public-beta-vienna">Vienna</StyledLink>{' '}
              tester courses. Again, these have only been made to demonstrate
              the feature, and are not complete courses - they feature only 5
              lines each.
            </p>
            <p>
              We highly recommend importing your own PGN file to really
              experience the feature. As for our own courses, we will be looking
              to launch our first set within the next two months.
            </p>
            <Button variant="primary" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      </>
    )
  );
}
