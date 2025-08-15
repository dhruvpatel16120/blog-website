#!/usr/bin/env node

/*
  Seeds 3 real-world IoT & Hardware posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'IoT & Hardware' category (slug: iot-hardware)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'IoT with Raspberry Pi: Sensors, MQTT, and Home Automation',
    excerpt: 'Build smart home projects with Raspberry Pi, sensor integration, and MQTT messaging.',
    tags: ['iot', 'raspberry-pi', 'mqtt', 'home-automation']
  },
  {
    title: 'Edge Computing: Real-Time Data Processing on Embedded Devices',
    excerpt: 'Process data at the edge with microcontrollers, real-time OS, and cloud integration.',
    tags: ['edge-computing', 'embedded', 'microcontrollers', 'cloud']
  },
  {
    title: 'Prototyping with Arduino: Rapid Hardware Development for Beginners',
    excerpt: 'Get started with Arduino: breadboarding, sensors, and rapid prototyping for IoT solutions.',
    tags: ['arduino', 'prototyping', 'sensors', 'hardware']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Practical IoT and hardware guidance for makers and engineers.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
IoT and hardware projects connect the physical and digital worlds for automation and insight.

## Key Topics
- Sensor integration
- Wireless protocols (MQTT, Zigbee, BLE)
- Edge vs. cloud processing
- Prototyping and iteration

## Example
\`\`\`cpp
// Arduino: read temperature sensor
int sensorPin = A0;
void setup() { Serial.begin(9600); }
void loop() {
  int value = analogRead(sensorPin);
  float voltage = value * (5.0 / 1023.0);
  Serial.println(voltage);
  delay(1000);
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 IoT & Hardware Posts Seeding Script');
    utils.log('Creating realistic IoT & hardware posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'IoT & Hardware',
      slug: 'iot-hardware',
      description: 'Internet of Things, embedded systems, and hardware programming',
      color: '#FF6B6B',
      icon: '🔌'
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
          viewCount: 200 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} IoT & Hardware posts successfully!`, 'green');
    
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
