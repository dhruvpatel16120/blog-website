#!/usr/bin/env node

/*
  Seeds 3 real-world Blockchain & Web3 posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Blockchain & Web3' category (slug: blockchain-web3)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Smart Contracts in 2025: Solidity, Auditing, and Upgrade Patterns',
    excerpt: 'Write secure, upgradeable smart contracts with Solidity, OpenZeppelin, and modern auditing tools.',
    tags: ['blockchain', 'smart-contracts', 'solidity', 'auditing']
  },
  {
    title: 'DeFi Deep Dive: Yield Farming, Liquidity Pools, and Risks',
    excerpt: 'Understand the mechanics and risks of DeFi protocols: yield farming, AMMs, and liquidity mining.',
    tags: ['defi', 'yield-farming', 'liquidity-pools', 'risk-management']
  },
  {
    title: 'NFTs Beyond Art: Gaming, Identity, and Real-World Assets',
    excerpt: 'Explore the next wave of NFTs: gaming, digital identity, and tokenizing real-world assets.',
    tags: ['nft', 'gaming', 'identity', 'tokenization']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Practical blockchain and web3 guidance for modern developers.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Blockchain and Web3 are transforming finance, gaming, and digital identity.

## Key Concepts
- Decentralization and trustless systems
- Smart contract security
- Token standards (ERC-20, ERC-721, ERC-1155)
- On-chain vs. off-chain data

## Example
\`\`\`solidity
// Minimal ERC-20 token
contract Token {
  mapping(address => uint) public balanceOf;
  function transfer(address to, uint amount) public {
    require(balanceOf[msg.sender] >= amount, 'Insufficient');
    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;
  }
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Blockchain & Web3 Posts Seeding Script');
    utils.log('Creating realistic blockchain & web3 posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Blockchain & Web3',
      slug: 'blockchain-web3',
      description: 'Blockchain technology, cryptocurrencies, and decentralized applications',
      color: '#F7931E',
      icon: '⛓️'
    });

    let count = 0;
    for (let i = 0; i < POSTS.length; i += 1) {
      const p = POSTS[i];
      const base = utils.slugify(p.title);
      const slug = await utils.generateUniqueSlug(base, 'post');
      const content = contentFor(p.title, p.tags);
      const readTime = utils.estimateReadTime(content);
      const publishedAt = utils.daysAgo(POSTS.length - i);
      const coverImage = utils.generateCoverImage(slug);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      const metaKeywords = utils.generateKeywords(p.title, p.tags);

      const created = await utils.prisma.post.create({
        data: {
          title: p.title,
          slug,
          excerpt: p.excerpt,
          content,
          coverImage,
          published: true,
          featured: i === 0,
          viewCount: 300 + Math.floor(Math.random() * 3000),
          readTime,
          wordCount,
          charCount,
          authorId: author.id,
          publishedAt,
          seoTitle: p.title,
          seoDescription: p.excerpt,
          seoImage: coverImage,
          metaKeywords
        }
      });

      await utils.prisma.postCategory.create({ data: { postId: created.id, categoryId: category.id } });
      for (const t of p.tags) {
        const tag = await utils.upsertTag({
          name: t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: utils.slugify(t),
          color: '#6B7280'
        });
        await utils.prisma.postTag.create({ data: { postId: created.id, tagId: tag.id } });
      }

      count += 1;
      utils.logSuccess(`Created: ${created.title} (${created.slug})`);
    }
    
    utils.logSection('✅ Seeding Complete');
    utils.log(`Created ${count} Blockchain & Web3 posts successfully!`, 'green');
    
  } catch (e) {
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

seed().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
