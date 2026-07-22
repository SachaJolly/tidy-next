import { addons } from 'storybook/manager-api';
import { theme } from './theme';

addons.setConfig({ theme });

const style = document.createElement('style');
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

  #storybook-explorer-tree a:hover,
  #storybook-explorer-tree button:hover {
    background: hsla(245, 100%, 68%, 0.1) !important;
  }
  #storybook-explorer-tree [data-action="collapse-root"]::after,
  .sidebar-subheading-action::after,
  [class*="CollapseButton"]::after {
    background: linear-gradient(transparent, hsl(0, 0%, 94%)) !important;
  }
  h1, h2, h3, h4, h5, h6,
  [class*="title"], [class*="Title"],
  [class*="heading"], [class*="Heading"] {
    font-family: "Space Grotesk", sans-serif !important;
    font-weight: 700 !important;
  }
`;
document.head.appendChild(style);
