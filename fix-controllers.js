const fs = require('fs');
const path = require('path');

const controllers = [
  'server/src/controllers/quickNoteController.ts',
  'server/src/controllers/readingGoalController.ts',
  'server/src/controllers/visionBoardController.ts',
  'server/src/controllers/writingProjectController.ts'
];

const modelMethodMappings = {
  'QuickNoteModel.getAll()': 'QuickNoteModel.getAll(req.user.userId)',
  'QuickNoteModel.getById(id)': 'QuickNoteModel.getById(id, req.user.userId)',
  'QuickNoteModel.create(data)': 'QuickNoteModel.create(data, req.user.userId)',
  'QuickNoteModel.update(id, data)': 'QuickNoteModel.update(id, data, req.user.userId)',
  'QuickNoteModel.delete(id)': 'QuickNoteModel.delete(id, req.user.userId)',
  'QuickNoteModel.getCount()': 'QuickNoteModel.getCount(req.user.userId)',
  
  'ReadingGoalModel.getAll()': 'ReadingGoalModel.getAll(req.user.userId)',
  'ReadingGoalModel.getById(id)': 'ReadingGoalModel.getById(id, req.user.userId)',
  'ReadingGoalModel.getActiveGoal()': 'ReadingGoalModel.getActiveGoal(req.user.userId)',
  'ReadingGoalModel.getByYear(parseInt(year))': 'ReadingGoalModel.getByYear(parseInt(year), req.user.userId)',
  'ReadingGoalModel.create(data)': 'ReadingGoalModel.create(data, req.user.userId)',
  'ReadingGoalModel.update(id, data)': 'ReadingGoalModel.update(id, data, req.user.userId)',
  'ReadingGoalModel.delete(id)': 'ReadingGoalModel.delete(id, req.user.userId)',
  
  'VisionBoardModel.getAll()': 'VisionBoardModel.getAll(req.user.userId)',
  'VisionBoardModel.getById(id)': 'VisionBoardModel.getById(id, req.user.userId)',
  'VisionBoardModel.getByYearAndMonth(': 'VisionBoardModel.getByYearAndMonth(',
  'VisionBoardModel.create(boardData)': 'VisionBoardModel.create(boardData, req.user.userId)',
  
  'WritingProjectModel.getAll()': 'WritingProjectModel.getAll(req.user.userId)',
  'WritingProjectModel.getById(id)': 'WritingProjectModel.getById(id, req.user.userId)',
  'WritingProjectModel.create(projectData)': 'WritingProjectModel.create(projectData, req.user.userId)',
  'WritingProjectModel.update(id, updateData)': 'WritingProjectModel.update(id, updateData, req.user.userId)',
  'WritingProjectModel.delete(id)': 'WritingProjectModel.delete(id, req.user.userId)',
  'WritingProjectModel.updateWordCount(id, wordCount)': 'WritingProjectModel.updateWordCount(id, wordCount, req.user.userId)'
};

function addAuthCheck(content) {
  // Add authentication check after try {
  return content.replace(/(try\s*\{)/g, '$1\n      if (!req.user) {\n        return res.status(401).json({ error: \'Authentication required\' });\n      }');
}

function updateModelCalls(content) {
  let updatedContent = content;
  
  for (const [oldCall, newCall] of Object.entries(modelMethodMappings)) {
    if (oldCall.includes('getByYearAndMonth(')) {
      // Special case for getByYearAndMonth
      updatedContent = updatedContent.replace(
        /VisionBoardModel\.getByYearAndMonth\(([^)]+)\)/g,
        'VisionBoardModel.getByYearAndMonth($1, req.user.userId)'
      );
    } else {
      updatedContent = updatedContent.replace(new RegExp(oldCall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newCall);
    }
  }
  
  return updatedContent;
}

controllers.forEach(controllerPath => {
  if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Add authentication checks
    content = addAuthCheck(content);
    
    // Update model method calls
    content = updateModelCalls(content);
    
    fs.writeFileSync(controllerPath, content);
    console.log(`✅ Updated ${controllerPath}`);
  } else {
    console.log(`❌ File not found: ${controllerPath}`);
  }
});

console.log('\n🎉 All controllers updated!'); 