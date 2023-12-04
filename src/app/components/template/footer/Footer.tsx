import Heading from "../../_elements/heading";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 md:px-12 flex flex-col text-sm gap-4">
      <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
        <div>
          <Heading as={"h3"}>ChessTraining.app</Heading>
          <ul>
            <li>About Us</li>
            <li>FAQ's</li>
            <li>Our Team</li>
            <li>Blog</li>
          </ul>
        </div>
        <div>
          <Heading as={"h3"}>Support</Heading>
          <ul>
            <li>Contact Us</li>
            <li>Report an issue</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
        <div>
          <Heading as={"h3"}>Socials</Heading>
          <ul>
            <li className="flex gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                />
              </svg>
              Instagram
            </li>
            <li className="flex gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584l-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
                />
              </svg>
              X/Twitter
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center text-xs italic">
        <p>&copy; 2020-2023 ChessTraining.app</p>
      </div>
    </footer>
  );
}
