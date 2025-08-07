export default function SocialShare({ title, slug }) {
  const url = typeof window !== 'undefined'
    ? window.location.origin + '/blog/' + slug
    : '/blog/' + slug;
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinShare = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

  return (
    <div className="flex gap-4 mt-8">
      <a href={twitterShare} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        Share on Twitter
      </a>
      <a href={linkedinShare} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
        Share on LinkedIn
      </a>
    </div>
  );
}