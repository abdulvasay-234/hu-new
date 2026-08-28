import { getValidatedBlogSources } from './blogs-content.mjs';

const run = () => {
  try {
    const posts = getValidatedBlogSources({ strictAssets: true });
    const featuredCount = posts.filter((post) => post.featured).length;

    if (featuredCount > 1) {
      throw new Error(`Only one featured blog is allowed, but found ${featuredCount}.`);
    }

    console.log(`Validated ${posts.length} blog content files successfully.`);
  } catch (error) {
    console.error('Blog content validation failed.');
    console.error(error.message);
    process.exit(1);
  }
};

run();
