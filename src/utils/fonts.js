import { library } from "@fortawesome/fontawesome-svg-core"
import { faLink, faPowerOff, faUser } from "@fortawesome/free-solid-svg-icons"

/**
 * Font family constants
 */
export const FONTS = {
  PRIMARY: "'Afacad Flux', sans-serif",
  SECONDARY: "'Barlow Condensed', sans-serif",
}

/**
 * Font weight constants
 */
export const FONT_WEIGHTS = {
  THIN: 100,
  EXTRA_LIGHT: 200,
  LIGHT: 300,
  REGULAR: 400,
  MEDIUM: 500,
  SEMI_BOLD: 600,
  BOLD: 700,
  EXTRA_BOLD: 800,
  BLACK: 900,
}

/**
 * Initialize Font Awesome icons for use throughout the application
 * This function adds the required icons to the Font Awesome library
 */
function initFontAwesome() {
  // Add icons to the library
  library.add(faLink)
  library.add(faUser)
  library.add(faPowerOff)

  // You can add more icons here as needed
  // Example: library.add(faHome, faSearch, faCheck);
}

/**
 * Load web fonts dynamically
 */
function loadWebFonts() {
  const links = [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
    },
  ]

  links.forEach((linkProps) => {
    // Check if the link already exists
    const existingLink = document.querySelector(`link[href="${linkProps.href}"]`)
    if (!existingLink) {
      const link = document.createElement("link")
      Object.entries(linkProps).forEach(([key, value]) => {
        link[key] = value
      })
      document.head.appendChild(link)
    }
  })
}

/**
 * Initialize all fonts and icons
 */
export default function initFonts() {
  // Initialize Font Awesome
  initFontAwesome()

  // Load web fonts if we're in a browser environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    loadWebFonts()
  }

  console.log("Fonts initialized: Afacad Flux and Barlow Condensed")
}

/**
 * Returns a style object with the primary font family
 * @param {Object} additionalStyles - Additional styles to merge
 * @returns {Object} Style object with font-family set to primary font
 */
export const primaryFont = (additionalStyles = {}) => ({
  fontFamily: FONTS.PRIMARY,
  ...additionalStyles,
})

/**
 * Returns a style object with the secondary font family
 * @param {Object} additionalStyles - Additional styles to merge
 * @returns {Object} Style object with font-family set to secondary font
 */
export const secondaryFont = (additionalStyles = {}) => ({
  fontFamily: FONTS.SECONDARY,
  ...additionalStyles,
})

/**
 * Returns a style object for headings
 * @param {Object} additionalStyles - Additional styles to merge
 * @returns {Object} Style object for headings
 */
export const headingFont = (additionalStyles = {}) => ({
  fontFamily: FONTS.SECONDARY,
  fontWeight: FONT_WEIGHTS.SEMI_BOLD,
  ...additionalStyles,
})

/**
 * Returns a style object for body text
 * @param {Object} additionalStyles - Additional styles to merge
 * @returns {Object} Style object for body text
 */
export const bodyFont = (additionalStyles = {}) => ({
  fontFamily: FONTS.PRIMARY,
  fontWeight: FONT_WEIGHTS.REGULAR,
  ...additionalStyles,
})