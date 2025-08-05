import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function clearData() {
  try {
    console.log('🧹 Clearing existing data...');
    
    // List of files to clear (keep users.json)
    const filesToClear = [
      'books.json',
      'journals.json', 
      'writing-projects.json',
      'tasks.json',
      'notes.json',
      'vision-boards.json',
      'quick-notes.json',
      'reading-goals.json'
    ];

    for (const file of filesToClear) {
      const filePath = path.join(DATA_DIR, file);
      try {
        await fs.writeFile(filePath, '[]');
        console.log(`✅ Cleared ${file}`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${file}: ${error.message}`);
      }
    }

    console.log('🎉 Data cleared successfully!');
    console.log('📝 Each new user will now start with empty data.');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

clearData(); 