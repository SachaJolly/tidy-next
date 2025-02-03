import type { Preview } from "@storybook/react";
import "@/app/primitives.css";
import "@/app/themes.css";
import "@/app/globals.css";

import "./docs.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
