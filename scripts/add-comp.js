const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting competition seeding for IDs 7 & 8...');

  // Competition 7: Singing - Own Composition
  const singing = await prisma.competition.upsert({
    where: { legacyId: 7 },
    update: {
      title: 'VK Harmonies (Original Composition)',
      description: 'Compose and perform original songs inspired by Vasudhaiva Kutumbakam values.',
      slug: 'singing',
      icon: '🎵',
      color: 'from-red-500 to-red-600',
      deadline: new Date('2025-11-30T23:59:59+05:30'),
      prizePool: '₹50,000',
      prizes: {
        first: '₹25,000',
        second: '₹15,000',
        third: '₹10,000',
      },
      sections: [
        {
          id: 'problem-statement',
          title: 'Problem Statement',
          content: `<p>Welcome to VK Harmonies! Compose and perform original songs inspired by Vasudhaiva Kutumbakam philosophy.</p>

<p><strong>📢 Week 1 Challenge – VK Competition</strong></p>

<p>Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use music and creativity to explore solutions for modern global and legal issues through original compositions aligned with VK themes.</p>

<p><strong>🌏 Geopolitics & Global Governance</strong></p>
<ol>
<li>Reforming the UN for fair global participation</li>
<li>Uniting the Global South to raise its collective voice</li>
<li>Lessons from ancient diplomacy for modern international relations</li>
<li>Promoting global peace through Vasudhaiva Kutumbakam philosophy</li>
<li>Decolonizing the consciousness of the Global South</li>
</ol>

<p><strong>⚖️ Legal & Constitutional Focus</strong></p>
<ol>
<li>Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative</li>
<li>Secularism in Ancient India: Beyond the Western Paradigm</li>
<li>Rights vs Duties: What Should Take Precedence in Nation-Building?</li>
</ol>

<p>Choose any one topic and express your ideas through VK Harmonies. Be creative, ethical, and inspiring!</p>

<p><strong>Objective:</strong> Create original musical compositions that combine the importance of ancient wisdom aligned to VK themes with contemporary concerns to inspire global unity and shared responsibility. For resources, visit <strong>vk.jyot.in</strong></p>`,
        },
        {
          id: 'song-guidelines',
          title: 'Song Composition Guidelines',
          content: `<p>Compose an entirely original song based on the importance of ancient wisdom aligned to VK themes.</p>

<p><strong>Technical Specifications:</strong></p>
<ul>
<li>Duration: 2-4 minutes</li>
<li>Format: MP3, WAV, or M4A audio file</li>
<li>Language: English, Hindi, or any Indian language</li>
<li>Audio Quality: Record in a quiet environment with clear sound</li>
<li>Instrumentation: Simple instrumentation or acapella—clarity is more important than effects</li>
</ul>`,
        },
        {
          id: 'dos-donts',
          title: 'Do\'s & Don\'ts',
          content: `<p><strong>✓ Do:</strong></p>
<ul>
<li>Compose an entirely original song based on importance of ancient wisdom aligned to VK themes</li>
<li>Ensure the lyrics are clear, clean, and meaningful</li>
<li>Maintain good audio quality—record in a quiet environment</li>
<li>Keep the duration within the specified time limit (2-4 minutes)</li>
<li>Mention the composer and lyricist clearly (the participant can be both)</li>
<li>Use simple instrumentation or acapella if needed—clarity is more important than effects</li>
</ul>

<p><strong>✗ Don't:</strong></p>
<ul>
<li>Do not use copyrighted tunes, background tracks, or melodies</li>
<li>Do not submit songs with abusive, political, communal, or controversial content</li>
<li>Do not over-edit or auto-tune excessively</li>
<li>Do not perform cover songs or adapt existing movie/music tunes</li>
</ul>`,
        },
        {
          id: 'recommended-tools',
          title: 'Recommended Tools',
          content: `<p>Explore these tools to enhance your composition:</p>

<p><strong>Music Production:</strong></p>
<ul>
<li>GarageBand - Simple music creation and recording</li>
<li>Audacity - Free audio recording and editing</li>
<li>FL Studio - Professional music production</li>
<li>Ableton Live - Advanced music composition</li>
</ul>

<p><strong>Lyric Writing & AI Assistance:</strong></p>
<ul>
<li>ChatGPT - Lyric ideation and refinement</li>
<li>Gemini - Creative brainstorming</li>
</ul>`,
        },
        {
          id: 'prizes',
          title: 'Prizes',
          content: `<p>Total Prize Pool: <strong>₹50,000</strong></p>
<ul>
<li>1st: <strong>₹25,000</strong></li>
<li>2nd: <strong>₹15,000</strong></li>
<li>3rd: <strong>₹10,000</strong></li>
</ul>`,
        },
        {
          id: 'submission-guidelines',
          title: 'Submission Guidelines',
          content: `<p>Follow these guidelines for a successful submission:</p>

<p><strong>Submission Process:</strong></p>
<ul>
<li>Use the submission panel on this page</li>
<li>Provide your name and email address</li>
<li>Upload your audio file directly (MP3, WAV, or M4A)</li>
<li>Include a brief description of your song concept</li>
<li>Submit before the deadline: <strong>November 30, 2025 11:59:59 PM IST</strong></li>
</ul>

<p><strong>Required Information:</strong></p>
<ul>
<li>Song title and duration</li>
<li>Lyrics (in text format, attached as .txt or .pdf)</li>
<li>Which topic you've chosen</li>
<li>Composer and lyricist name(s)</li>
<li>Brief explanation of your creative process</li>
<li>Inspiration or reference sources</li>
<li>List of music production tools used</li>
</ul>

<p><strong>Evaluation Criteria:</strong></p>
<ul>
<li>Creativity and Originality (30%)</li>
<li>Relevance to the theme (35%)</li>
<li>Lyrical Quality and Message (20%)</li>
<li>Audio Quality and Production (15%)</li>
</ul>`,
        },
      ],
      isPublished: true,
    },
    create: {
      legacyId: 7,
      title: 'VK Harmonies (Original Composition)',
      description: 'Compose and perform original songs inspired by Vasudhaiva Kutumbakam values.',
      slug: 'singing',
      icon: '🎵',
      color: 'from-red-500 to-red-600',
      deadline: new Date('2025-11-30T23:59:59+05:30'),
      prizePool: '₹50,000',
      prizes: {
        first: '₹25,000',
        second: '₹15,000',
        third: '₹10,000',
      },
      sections: [
        {
          id: 'problem-statement',
          title: 'Problem Statement',
          content: `<p>Welcome to VK Harmonies! Compose and perform original songs inspired by Vasudhaiva Kutumbakam philosophy.</p>

<p><strong>📢 Week 1 Challenge – VK Competition</strong></p>

<p>Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use music and creativity to explore solutions for modern global and legal issues through original compositions aligned with VK themes.</p>

<p><strong>🌏 Geopolitics & Global Governance</strong></p>
<ol>
<li>Reforming the UN for fair global participation</li>
<li>Uniting the Global South to raise its collective voice</li>
<li>Lessons from ancient diplomacy for modern international relations</li>
<li>Promoting global peace through Vasudhaiva Kutumbakam philosophy</li>
<li>Decolonizing the consciousness of the Global South</li>
</ol>

<p><strong>⚖️ Legal & Constitutional Focus</strong></p>
<ol>
<li>Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative</li>
<li>Secularism in Ancient India: Beyond the Western Paradigm</li>
<li>Rights vs Duties: What Should Take Precedence in Nation-Building?</li>
</ol>

<p>Choose any one topic and express your ideas through VK Harmonies. Be creative, ethical, and inspiring!</p>

<p><strong>Objective:</strong> Create original musical compositions that combine the importance of ancient wisdom aligned to VK themes with contemporary concerns to inspire global unity and shared responsibility. For resources, visit <strong>vk.jyot.in</strong></p>`,
        },
        {
          id: 'song-guidelines',
          title: 'Song Composition Guidelines',
          content: `<p>Compose an entirely original song based on the importance of ancient wisdom aligned to VK themes.</p>

<p><strong>Technical Specifications:</strong></p>
<ul>
<li>Duration: 2-4 minutes</li>
<li>Format: MP3, WAV, or M4A audio file</li>
<li>Language: English, Hindi, or any Indian language</li>
<li>Audio Quality: Record in a quiet environment with clear sound</li>
<li>Instrumentation: Simple instrumentation or acapella—clarity is more important than effects</li>
</ul>`,
        },
        {
          id: 'dos-donts',
          title: 'Do\'s & Don\'ts',
          content: `<p><strong>✓ Do:</strong></p>
<ul>
<li>Compose an entirely original song based on importance of ancient wisdom aligned to VK themes</li>
<li>Ensure the lyrics are clear, clean, and meaningful</li>
<li>Maintain good audio quality—record in a quiet environment</li>
<li>Keep the duration within the specified time limit (2-4 minutes)</li>
<li>Mention the composer and lyricist clearly (the participant can be both)</li>
<li>Use simple instrumentation or acapella if needed—clarity is more important than effects</li>
</ul>

<p><strong>✗ Don't:</strong></p>
<ul>
<li>Do not use copyrighted tunes, background tracks, or melodies</li>
<li>Do not submit songs with abusive, political, communal, or controversial content</li>
<li>Do not over-edit or auto-tune excessively</li>
<li>Do not perform cover songs or adapt existing movie/music tunes</li>
</ul>`,
        },
        {
          id: 'recommended-tools',
          title: 'Recommended Tools',
          content: `<p>Explore these tools to enhance your composition:</p>

<p><strong>Music Production:</strong></p>
<ul>
<li>GarageBand - Simple music creation and recording</li>
<li>Audacity - Free audio recording and editing</li>
<li>FL Studio - Professional music production</li>
<li>Ableton Live - Advanced music composition</li>
</ul>

<p><strong>Lyric Writing & AI Assistance:</strong></p>
<ul>
<li>ChatGPT - Lyric ideation and refinement</li>
<li>Gemini - Creative brainstorming</li>
</ul>`,
        },
        {
          id: 'prizes',
          title: 'Prizes',
          content: `<p>Total Prize Pool: <strong>₹50,000</strong></p>
<ul>
<li>1st: <strong>₹25,000</strong></li>
<li>2nd: <strong>₹15,000</strong></li>
<li>3rd: <strong>₹10,000</strong></li>
</ul>`,
        },
        {
          id: 'submission-guidelines',
          title: 'Submission Guidelines',
          content: `<p>Follow these guidelines for a successful submission:</p>

<p><strong>Submission Process:</strong></p>
<ul>
<li>Use the submission panel on this page</li>
<li>Provide your name and email address</li>
<li>Upload your audio file directly (MP3, WAV, or M4A)</li>
<li>Include a brief description of your song concept</li>
<li>Submit before the deadline: <strong>November 30, 2025 11:59:59 PM IST</strong></li>
</ul>

<p><strong>Required Information:</strong></p>
<ul>
<li>Song title and duration</li>
<li>Lyrics (in text format, attached as .txt or .pdf)</li>
<li>Which topic you've chosen</li>
<li>Composer and lyricist name(s)</li>
<li>Brief explanation of your creative process</li>
<li>Inspiration or reference sources</li>
<li>List of music production tools used</li>
</ul>

<p><strong>Evaluation Criteria:</strong></p>
<ul>
<li>Creativity and Originality (30%)</li>
<li>Relevance to the theme (35%)</li>
<li>Lyrical Quality and Message (20%)</li>
<li>Audio Quality and Production (15%)</li>
</ul>`,
        },
      ],
      isPublished: true,
    },
  });

  console.log('✅ Competition 7 (Singing) created/updated:', singing.title);

  // Competition 8: Poetry Writing
  const poetry = await prisma.competition.upsert({
    where: { legacyId: 8 },
    update: {
      title: 'VK Verses (Poetry)',
      description: 'Write original poetry expressing Vasudhaiva Kutumbakam values and global unity.',
      slug: 'poetry',
      icon: '✨',
      color: 'from-indigo-500 to-indigo-600',
      deadline: new Date('2025-11-30T23:59:59+05:30'),
      prizePool: '₹35,200',
      prizes: {
        first: '₹16,000',
        second: '₹11,000',
        third: '₹8,200',
      },
      sections: [
        {
          id: 'problem-statement',
          title: 'Problem Statement',
          content: `<p>Welcome to VK Verses! Write original poetry inspired by Vasudhaiva Kutumbakam values and global unity.</p>

<p><strong>📢 Week 1 Challenge – VK Competition</strong></p>

<p>Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use the power of words and verse to explore solutions for modern global and legal issues through poetry grounded in VK philosophy.</p>

<p><strong>🌏 Geopolitics & Global Governance</strong></p>
<ol>
<li>Reforming the UN for fair global participation</li>
<li>Uniting the Global South to raise its collective voice</li>
<li>Lessons from ancient diplomacy for modern international relations</li>
<li>Promoting global peace through Vasudhaiva Kutumbakam philosophy</li>
<li>Decolonizing the consciousness of the Global South</li>
</ol>

<p><strong>⚖️ Legal & Constitutional Focus</strong></p>
<ol>
<li>Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative</li>
<li>Secularism in Ancient India: Beyond the Western Paradigm</li>
<li>Rights vs Duties: What Should Take Precedence in Nation-Building?</li>
</ol>

<p>Choose any one topic and express your ideas through VK Verses. Be creative, ethical, and inspiring!</p>

<p><strong>Objective:</strong> Create original poetry that weaves together ancient philosophy, civilizational wisdom, and contemporary concerns to illuminate paths toward global harmony and ethical leadership. For guidelines, visit <strong>vk.jyot.in</strong></p>`,
        },
        {
          id: 'poetry-guidelines',
          title: 'Poetry Writing Guidelines',
          content: `<p>Write an original poem inspired by VK values.</p>

<p><strong>Technical Specifications:</strong></p>
<ul>
<li>Word Count: 300-1000 words (for complete poem or collection)</li>
<li>Format: PDF or DOCX</li>
<li>Language: English, Hindi, Sanskrit, or any Indian language</li>
<li>Poetry Forms: Free verse, rhyme, haiku, sonnet, couplets, or any traditional/modern form</li>
<li>Submission Format: Typed or clearly handwritten</li>
<li>Clarity: Ensure clarity in presentation and readability</li>
</ul>`,
        },
        {
          id: 'dos-donts',
          title: 'Do\'s & Don\'ts',
          content: `<p><strong>✓ Do:</strong></p>
<ul>
<li>Write an original poem inspired by VK values</li>
<li>Ensure the poem is meaningful, coherent, and emotionally resonant</li>
<li>Use any style—free verse, rhyme, haiku, etc.</li>
<li>Keep language polite, respectful, and appropriate for all ages</li>
<li>Maintain clarity in typed submission</li>
<li>Stay within the word limit (300-1000 words)</li>
</ul>

<p><strong>✗ Don't:</strong></p>
<ul>
<li>Do not copy poems from books</li>
<li>Do not use offensive, political, abusive, or discriminatory language</li>
<li>Do not include religious bias, personal attacks, or sensitive references</li>
<li>Do not exceed the allowed length or submit unreadable presentation</li>
</ul>`,
        },
        {
          id: 'submission-guidelines',
          title: 'Submission Guidelines',
          content: `<p>Follow these guidelines for a successful submission:</p>

<p><strong>Submission Process:</strong></p>
<ul>
<li>Use the submission panel on this page</li>
<li>Provide your name and email address</li>
<li>Upload your poetry file directly (PDF or DOCX format)</li>
<li>Include a brief introduction to your work</li>
<li>Submit before the deadline: <strong>November 30, 2025 11:59:59 PM IST</strong></li>
</ul>

<p><strong>Required Information:</strong></p>
<ul>
<li>Title(s) of your poem(s)</li>
<li>Which topic you've chosen</li>
<li>Poetry form(s) used</li>
<li>Language(s) of composition</li>
<li>Word count</li>
<li>Brief explanation of your creative process and inspiration</li>
<li>List of any AI tools used (if applicable)</li>
<li>Literary influences or reference sources (if any)</li>
</ul>

<p><strong>Evaluation Criteria:</strong></p>
<ul>
<li>Creativity and Originality (30%)</li>
<li>Relevance to the theme (35%)</li>
<li>Poetic Quality and Language (20%)</li>
<li>Emotional Impact and Depth (15%)</li>
</ul>`,
        },
        {
          id: 'prizes',
          title: 'Prizes',
          content: `<p>Total Prize Pool: <strong>₹35,200</strong></p>
<ul>
<li>1st: <strong>₹16,000</strong></li>
<li>2nd: <strong>₹11,000</strong></li>
<li>3rd: <strong>₹8,200</strong></li>
</ul>`,
        },
      ],
      isPublished: true,
    },
    create: {
      legacyId: 8,
      title: 'VK Verses (Poetry)',
      description: 'Write original poetry expressing Vasudhaiva Kutumbakam values and global unity.',
      slug: 'poetry',
      icon: '✨',
      color: 'from-indigo-500 to-indigo-600',
      deadline: new Date('2025-11-30T23:59:59+05:30'),
      prizePool: '₹35,200',
      prizes: {
        first: '₹16,000',
        second: '₹11,000',
        third: '₹8,200',
      },
      sections: [
        {
          id: 'problem-statement',
          title: 'Problem Statement',
          content: `<p>Welcome to VK Verses! Write original poetry inspired by Vasudhaiva Kutumbakam values and global unity.</p>

<p><strong>📢 Week 1 Challenge – VK Competition</strong></p>

<p>Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use the power of words and verse to explore solutions for modern global and legal issues through poetry grounded in VK philosophy.</p>

<p><strong>🌏 Geopolitics & Global Governance</strong></p>
<ol>
<li>Reforming the UN for fair global participation</li>
<li>Uniting the Global South to raise its collective voice</li>
<li>Lessons from ancient diplomacy for modern international relations</li>
<li>Promoting global peace through Vasudhaiva Kutumbakam philosophy</li>
<li>Decolonizing the consciousness of the Global South</li>
</ol>

<p><strong>⚖️ Legal & Constitutional Focus</strong></p>
<ol>
<li>Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative</li>
<li>Secularism in Ancient India: Beyond the Western Paradigm</li>
<li>Rights vs Duties: What Should Take Precedence in Nation-Building?</li>
</ol>

<p>Choose any one topic and express your ideas through VK Verses. Be creative, ethical, and inspiring!</p>

<p><strong>Objective:</strong> Create original poetry that weaves together ancient philosophy, civilizational wisdom, and contemporary concerns to illuminate paths toward global harmony and ethical leadership. For guidelines, visit <strong>vk.jyot.in</strong></p>`,
        },
        {
          id: 'poetry-guidelines',
          title: 'Poetry Writing Guidelines',
          content: `<p>Write an original poem inspired by VK values.</p>

<p><strong>Technical Specifications:</strong></p>
<ul>
<li>Word Count: 300-1000 words (for complete poem or collection)</li>
<li>Format: PDF or DOCX</li>
<li>Language: English, Hindi, Sanskrit, or any Indian language</li>
<li>Poetry Forms: Free verse, rhyme, haiku, sonnet, couplets, or any traditional/modern form</li>
<li>Submission Format: Typed or clearly handwritten</li>
<li>Clarity: Ensure clarity in presentation and readability</li>
</ul>`,
        },
        {
          id: 'dos-donts',
          title: 'Do\'s & Don\'ts',
          content: `<p><strong>✓ Do:</strong></p>
<ul>
<li>Write an original poem inspired by VK values</li>
<li>Ensure the poem is meaningful, coherent, and emotionally resonant</li>
<li>Use any style—free verse, rhyme, haiku, etc.</li>
<li>Keep language polite, respectful, and appropriate for all ages</li>
<li>Maintain clarity in typed submission</li>
<li>Stay within the word limit (300-1000 words)</li>
</ul>

<p><strong>✗ Don't:</strong></p>
<ul>
<li>Do not copy poems from books</li>
<li>Do not use offensive, political, abusive, or discriminatory language</li>
<li>Do not include religious bias, personal attacks, or sensitive references</li>
<li>Do not exceed the allowed length or submit unreadable presentation</li>
</ul>`,
        },
        {
          id: 'submission-guidelines',
          title: 'Submission Guidelines',
          content: `<p>Follow these guidelines for a successful submission:</p>

<p><strong>Submission Process:</strong></p>
<ul>
<li>Use the submission panel on this page</li>
<li>Provide your name and email address</li>
<li>Upload your poetry file directly (PDF or DOCX format)</li>
<li>Include a brief introduction to your work</li>
<li>Submit before the deadline: <strong>November 30, 2025 11:59:59 PM IST</strong></li>
</ul>

<p><strong>Required Information:</strong></p>
<ul>
<li>Title(s) of your poem(s)</li>
<li>Which topic you've chosen</li>
<li>Poetry form(s) used</li>
<li>Language(s) of composition</li>
<li>Word count</li>
<li>Brief explanation of your creative process and inspiration</li>
<li>List of any AI tools used (if applicable)</li>
<li>Literary influences or reference sources (if any)</li>
</ul>

<p><strong>Evaluation Criteria:</strong></p>
<ul>
<li>Creativity and Originality (30%)</li>
<li>Relevance to the theme (35%)</li>
<li>Poetic Quality and Language (20%)</li>
<li>Emotional Impact and Depth (15%)</li>
</ul>`,
        },
        {
          id: 'prizes',
          title: 'Prizes',
          content: `<p>Total Prize Pool: <strong>₹35,200</strong></p>
<ul>
<li>1st: <strong>₹16,000</strong></li>
<li>2nd: <strong>₹11,000</strong></li>
<li>3rd: <strong>₹8,200</strong></li>
</ul>`,
        },
      ],
      isPublished: true,
    },
  });

  console.log('✅ Competition 8 (Poetry) created/updated:', poetry.title);

  console.log('🎉 All competitions seeded successfully!');
  console.log('---');
  console.log('Competition 7 - VK Harmonies (Singing)');
  console.log(`  ID: ${singing.id}`);
  console.log(`  Legacy ID: ${singing.legacyId}`);
  console.log(`  Slug: ${singing.slug}`);
  console.log('---');
  console.log('Competition 8 - VK Verses (Poetry)');
  console.log(`  ID: ${poetry.id}`);
  console.log(`  Legacy ID: ${poetry.legacyId}`);
  console.log(`  Slug: ${poetry.slug}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
