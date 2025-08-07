// Post data models/types for blog

/**
 * @typedef {Object} Author
 * @property {string} name
 * @property {string} [avatar]
 * @property {string} [bio]
 * @property {Object} [social] - Social links (twitter, github, linkedin, etc.)
 */

/**
 * @typedef {Object} Category
 * @property {string} name
 * @property {string} [color]
 * @property {number} [count]
 */

/**
 * @typedef {Object} Tag
 * @property {string} name
 */

/**
 * @typedef {Object} Post
 * @property {number|string} id
 * @property {string} title
 * @property {string} excerpt
 * @property {string} content
 * @property {string} coverImage
 * @property {Author} author
 * @property {string} publishedAt
 * @property {number} readTime
 * @property {Category[]} categories
 * @property {Tag[]} tags
 * @property {boolean} [featured]
 */