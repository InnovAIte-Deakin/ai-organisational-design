// AI Progress Tracker - Teacher Dashboard
// JavaScript for form handling and report generation

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadForm = document.getElementById('uploadForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const reportPlaceholder = document.getElementById('reportPlaceholder');
    const progressReport = document.getElementById('progressReport');
    
    // Tab navigation elements
    const individualTab = document.getElementById('individualTab');
    const bulkTab = document.getElementById('bulkTab');
    const rubricTab = document.getElementById('rubricTab');
    const individualSection = document.getElementById('individualSection');
    const bulkSection = document.getElementById('bulkSection');
    const rubricSection = document.getElementById('rubricSection');
    
    // Bulk upload elements
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentsContainer = document.getElementById('studentsContainer');
    const bulkAnalyzeBtn = document.getElementById('bulkAnalyzeBtn');
    const bulkCompassBtn = document.getElementById('bulkCompassBtn');
    const bulkStatus = document.getElementById('bulkStatus');
    
    let studentCounter = 0;
    let rubricCounter = 0;
    let savedRubrics = JSON.parse(localStorage.getItem('savedRubrics')) || [];
    
    // Tab Navigation
    function switchTab(tabName) {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and section
        if (tabName === 'individual') {
            individualTab.classList.add('active');
            individualSection.classList.add('active');
        } else if (tabName === 'bulk') {
            bulkTab.classList.add('active');
            bulkSection.classList.add('active');
        } else if (tabName === 'rubric') {
            rubricTab.classList.add('active');
            rubricSection.classList.add('active');
        }
    }
    
    // Tab event listeners
    individualTab.addEventListener('click', () => switchTab('individual'));
    bulkTab.addEventListener('click', () => switchTab('bulk'));
    rubricTab.addEventListener('click', () => switchTab('rubric'));
    
    // Add Student Entry
    function addStudentEntry() {
        studentCounter++;
        const studentEntry = document.createElement('div');
        studentEntry.className = 'student-entry';
        studentEntry.innerHTML = `
            <div class="student-entry-header">
                <span class="student-number">Student ${studentCounter}</span>
                <button type="button" class="remove-student-btn" onclick="removeStudentEntry(this)">
                    ✕ Remove
                </button>
            </div>
            <div class="student-fields">
                <div class="form-group">
                    <label class="form-label">Student Name</label>
                    <input type="text" class="form-input student-name-input" placeholder="Enter student's full name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Assignment Type</label>
                    <select class="form-select assignment-type-select" required>
                        <option value="">Select assignment type</option>
                        <option value="essay">Essay</option>
                        <option value="project">Project</option>
                        <option value="homework">Homework</option>
                        <option value="quiz">Quiz</option>
                        <option value="presentation">Presentation</option>
                    </select>
                </div>
                <div class="form-group student-work-field">
                    <label class="form-label">Student Work</label>
                    <textarea class="form-textarea student-work-textarea" placeholder="Paste student work here or describe the assignment..." rows="4"></textarea>
                </div>
                <div class="form-group student-photo-field">
                    <label class="form-label">Upload Photo of Work</label>
                    <div class="student-photo-upload-area">
                        <input type="file" class="student-photo-input" accept="image/*" style="display: none;">
                        <div class="student-photo-upload-content">
                            <div class="student-photo-icon">📷</div>
                            <p class="student-photo-text">Click to upload photo</p>
                            <button type="button" class="student-photo-btn">Choose Photo</button>
                        </div>
                        <div class="student-photo-preview" style="display: none;">
                            <img class="student-preview-image" src="" alt="Student work preview">
                            <div class="student-photo-actions">
                                <button type="button" class="student-remove-photo-btn">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        studentsContainer.appendChild(studentEntry);
        initializeStudentPhotoUpload(studentEntry);
        updateBulkButtons();
    }
    
    // Remove Student Entry
    window.removeStudentEntry = function(button) {
        button.closest('.student-entry').remove();
        updateStudentNumbers();
        updateBulkButtons();
    }
    
    // Update Student Numbers
    function updateStudentNumbers() {
        const entries = studentsContainer.querySelectorAll('.student-entry');
        entries.forEach((entry, index) => {
            entry.querySelector('.student-number').textContent = `Student ${index + 1}`;
        });
        studentCounter = entries.length;
    }
    
    // Update Bulk Buttons State
    function updateBulkButtons() {
        const entries = studentsContainer.querySelectorAll('.student-entry');
        const hasStudents = entries.length > 0;
        
        bulkAnalyzeBtn.disabled = !hasStudents;
        bulkCompassBtn.disabled = !hasStudents;
    }
    
    // Add Student Button Event Listener
    addStudentBtn.addEventListener('click', addStudentEntry);
    
    // Photo Upload Functionality
    function initializePhotoUpload() {
        const photoUpload = document.getElementById('photoUpload');
        const photoUploadBtn = document.getElementById('photoUploadBtn');
        const photoUploadArea = document.getElementById('photoUploadArea');
        const photoUploadContent = document.getElementById('photoUploadContent');
        const photoPreview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        
        if (!photoUpload) return;
        
        // Click to upload
        photoUploadBtn.addEventListener('click', () => photoUpload.click());
        photoUploadArea.addEventListener('click', () => photoUpload.click());
        
        // File selection
        photoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    photoUploadContent.style.display = 'none';
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Remove photo
        removePhotoBtn.addEventListener('click', function() {
            photoUpload.value = '';
            photoUploadContent.style.display = 'block';
            photoPreview.style.display = 'none';
        });
        
        // Change photo
        changePhotoBtn.addEventListener('click', () => photoUpload.click());
        
        // Drag and drop
        photoUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            photoUploadArea.style.borderColor = '#667eea';
            photoUploadArea.style.backgroundColor = '#f0f2ff';
        });
        
        photoUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            photoUploadArea.style.borderColor = '#dee2e6';
            photoUploadArea.style.backgroundColor = '#f8f9fa';
        });
        
        photoUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            photoUploadArea.style.borderColor = '#dee2e6';
            photoUploadArea.style.backgroundColor = '#f8f9fa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                photoUpload.files = files;
                photoUpload.dispatchEvent(new Event('change'));
            }
        });
    }
    
    // Initialize photo upload when DOM is loaded
    initializePhotoUpload();
    
    // Student photo upload functionality (for bulk upload)
    function initializeStudentPhotoUpload(studentEntry) {
        const photoInput = studentEntry.querySelector('.student-photo-input');
        const photoBtn = studentEntry.querySelector('.student-photo-btn');
        const photoArea = studentEntry.querySelector('.student-photo-upload-area');
        const photoContent = studentEntry.querySelector('.student-photo-upload-content');
        const photoPreview = studentEntry.querySelector('.student-photo-preview');
        const previewImage = studentEntry.querySelector('.student-preview-image');
        const removeBtn = studentEntry.querySelector('.student-remove-photo-btn');
        
        if (!photoInput) return;
        
        // Click to upload
        photoBtn.addEventListener('click', () => photoInput.click());
        photoArea.addEventListener('click', () => photoInput.click());
        
        // File selection
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    photoContent.style.display = 'none';
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Remove photo
        removeBtn.addEventListener('click', function() {
            photoInput.value = '';
            photoContent.style.display = 'block';
            photoPreview.style.display = 'none';
        });
        
        // Drag and drop
        photoArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            photoArea.style.borderColor = '#667eea';
            photoArea.style.backgroundColor = '#f0f2ff';
        });
        
        photoArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            photoArea.style.borderColor = '#dee2e6';
            photoArea.style.backgroundColor = '#f8f9fa';
        });
        
        photoArea.addEventListener('drop', function(e) {
            e.preventDefault();
            photoArea.style.borderColor = '#dee2e6';
            photoArea.style.backgroundColor = '#f8f9fa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                photoInput.files = files;
                photoInput.dispatchEvent(new Event('change'));
            }
        });
    }
    
    // Bulk Analyze All Students
    bulkAnalyzeBtn.addEventListener('click', function() {
        const entries = studentsContainer.querySelectorAll('.student-entry');
        if (entries.length === 0) {
            alert('Please add at least one student before analyzing.');
            return;
        }
        
        // Validate all entries
        let isValid = true;
        entries.forEach(entry => {
            const name = entry.querySelector('.student-name-input').value.trim();
            const type = entry.querySelector('.assignment-type-select').value;
            const work = entry.querySelector('.student-work-textarea').value.trim();
            
            if (!name || !type || !work) {
                isValid = false;
                entry.style.borderColor = '#dc3545';
            } else {
                entry.style.borderColor = '#e9ecef';
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields for all students.');
            return;
        }
        
        // Show loading state
        bulkAnalyzeBtn.disabled = true;
        bulkAnalyzeBtn.innerHTML = '<span class="btn-icon">⏳</span>Analyzing...';
        bulkStatus.style.display = 'block';
        bulkStatus.className = 'bulk-status';
        
        // Simulate analysis with individual student grading
        setTimeout(() => {
            // Analyze each student and add grade display
            entries.forEach((entry, index) => {
                const name = entry.querySelector('.student-name-input').value.trim();
                const type = entry.querySelector('.assignment-type-select').value;
                const work = entry.querySelector('.student-work-textarea').value.trim();
                
                // Generate a quick grade for this student
                const grade = generateQuickGrade(work, type);
                
                // Add grade display to the student entry
                addGradeToStudentEntry(entry, grade, name);
            });
            
            bulkAnalyzeBtn.disabled = false;
            bulkAnalyzeBtn.innerHTML = '<span class="btn-icon">🔍</span>Analyze All Students';
            bulkStatus.className = 'bulk-status success';
            bulkStatus.querySelector('.status-content').innerHTML = `
                <span class="status-icon">✅</span>
                <span class="status-text">Successfully analyzed ${entries.length} students!</span>
            `;
            
            // Enable Compass upload button
            bulkCompassBtn.disabled = false;
        }, 3000);
    });
    
    // Bulk Upload to Compass
    bulkCompassBtn.addEventListener('click', function() {
        const entries = studentsContainer.querySelectorAll('.student-entry');
        
        // Show loading state
        bulkCompassBtn.disabled = true;
        bulkCompassBtn.innerHTML = '<span class="btn-icon">⏳</span>Uploading...';
        bulkStatus.style.display = 'block';
        bulkStatus.className = 'bulk-status';
        bulkStatus.querySelector('.status-content').innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text">Uploading ${entries.length} students to Compass...</span>
        `;
        
        // Simulate upload
        setTimeout(() => {
            bulkCompassBtn.disabled = false;
            bulkCompassBtn.innerHTML = '<span class="btn-icon">📤</span>Upload All to Compass';
            bulkStatus.className = 'bulk-status success';
            bulkStatus.querySelector('.status-content').innerHTML = `
                <span class="status-icon">✅</span>
                <span class="status-text">Successfully uploaded ${entries.length} students to Compass!</span>
            `;
        }, 4000);
    });
    
    // Quick Grade Generation for Bulk Analysis
    function generateQuickGrade(studentWork, assignmentType) {
        const wordCount = studentWork.split(' ').length;
        const sentenceCount = studentWork.split('.').length;
        const avgWordsPerSentence = wordCount / sentenceCount;
        
        // Basic quality indicators
        const hasThesis = /thesis|argument|claim|position/i.test(studentWork);
        const hasEvidence = /because|therefore|evidence|example|support/i.test(studentWork);
        const hasTransitions = /however|moreover|furthermore|additionally|consequently/i.test(studentWork);
        const hasConclusion = /conclusion|summary|finally|in conclusion/i.test(studentWork);
        
        // Check for common issues
        const grammarIssues = countGrammarIssues(studentWork);
        const spellingIssues = countSpellingIssues(studentWork);
        
        // Calculate base score
        let score = 2; // Start with C (satisfactory)
        
        // Content quality
        if (hasThesis) score += 0.5;
        if (hasEvidence) score += 0.5;
        if (hasTransitions) score += 0.3;
        if (hasConclusion) score += 0.3;
        
        // Length and complexity
        if (wordCount > 150) score += 0.3;
        if (wordCount > 300) score += 0.4;
        if (avgWordsPerSentence > 12) score += 0.3;
        
        // Deduct for issues
        if (grammarIssues > 3) score -= 0.3;
        if (spellingIssues > 2) score -= 0.3;
        
        // Assignment type adjustments
        if (assignmentType === 'essay' && wordCount > 200) score += 0.2;
        if (assignmentType === 'project' && hasEvidence) score += 0.3;
        if (assignmentType === 'homework' && wordCount > 100) score += 0.2;
        if (assignmentType === 'quiz' && wordCount > 50) score += 0.2;
        if (assignmentType === 'presentation' && hasTransitions) score += 0.3;
        
        // Convert to letter grade
        return convertScoreToGrade(score);
    }
    
    function convertScoreToGrade(score) {
        if (score >= 3.7) return 'A+';
        if (score >= 3.3) return 'A';
        if (score >= 3.0) return 'A-';
        if (score >= 2.7) return 'B+';
        if (score >= 2.3) return 'B';
        if (score >= 2.0) return 'B-';
        if (score >= 1.7) return 'C+';
        if (score >= 1.3) return 'C';
        if (score >= 1.0) return 'C-';
        if (score >= 0.7) return 'D+';
        if (score >= 0.3) return 'D';
        return 'F';
    }
    
    function addGradeToStudentEntry(entry, grade, studentName) {
        // Check if grade display already exists
        let gradeDisplay = entry.querySelector('.student-grade-display');
        
        if (!gradeDisplay) {
            // Create grade display element
            gradeDisplay = document.createElement('div');
            gradeDisplay.className = 'student-grade-display';
            gradeDisplay.innerHTML = `
                <div class="grade-header">
                    <span class="grade-label">Grade:</span>
                    <span class="grade-value">${grade}</span>
                </div>
            `;
            
            // Insert after the student fields
            const studentFields = entry.querySelector('.student-fields');
            studentFields.parentNode.insertBefore(gradeDisplay, studentFields.nextSibling);
        } else {
            // Update existing grade
            gradeDisplay.querySelector('.grade-value').textContent = grade;
        }
        
        // Add animation
        gradeDisplay.style.opacity = '0';
        gradeDisplay.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            gradeDisplay.style.transition = 'all 0.5s ease-out';
            gradeDisplay.style.opacity = '1';
            gradeDisplay.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Rubric Management System
    function initializeRubricSystem() {
        const createRubricBtn = document.getElementById('createRubricBtn');
        const loadTemplateBtn = document.getElementById('loadTemplateBtn');
        const rubricSelect = document.getElementById('rubricSelect');
        const rubricSelectIndividual = document.getElementById('rubricSelectIndividual');
        const rubricEditor = document.getElementById('rubricEditor');
        const addCriteriaBtn = document.getElementById('addCriteriaBtn');
        const saveRubricBtn = document.getElementById('saveRubricBtn');
        const testRubricBtn = document.getElementById('testRubricBtn');
        
        // Load saved rubrics
        loadSavedRubrics();
        
        // Create new rubric
        createRubricBtn.addEventListener('click', function() {
            rubricEditor.style.display = 'block';
            document.getElementById('rubricPreview').style.display = 'none';
            clearRubricEditor();
        });
        
        // Load template
        loadTemplateBtn.addEventListener('click', function() {
            loadRubricTemplate();
        });
        
        // Add criteria
        addCriteriaBtn.addEventListener('click', addCriteria);
        
        // Save rubric
        saveRubricBtn.addEventListener('click', saveRubric);
        
        // Test rubric
        testRubricBtn.addEventListener('click', testRubric);
        
        // Rubric selection
        rubricSelect.addEventListener('change', function() {
            const selectedRubric = savedRubrics.find(r => r.id === this.value);
            if (selectedRubric) {
                loadRubricIntoEditor(selectedRubric);
            }
        });
    }
    
    function loadSavedRubrics() {
        const rubricSelect = document.getElementById('rubricSelect');
        const rubricSelectIndividual = document.getElementById('rubricSelectIndividual');
        
        // Clear existing options except the first one
        rubricSelect.innerHTML = '<option value="">Choose a rubric to use</option>';
        rubricSelectIndividual.innerHTML = '<option value="default">Use Default AI Analysis</option>';
        
        savedRubrics.forEach(rubric => {
            const option1 = new Option(rubric.name, rubric.id);
            const option2 = new Option(rubric.name, rubric.id);
            rubricSelect.add(option1);
            rubricSelectIndividual.add(option2);
        });
    }
    
    function addCriteria() {
        rubricCounter++;
        const criteriaContainer = document.getElementById('rubricCriteria');
        const criteriaItem = document.createElement('div');
        criteriaItem.className = 'criteria-item';
        criteriaItem.innerHTML = `
            <div class="criteria-header">
                <span class="criteria-title">Criteria ${rubricCounter}</span>
                <button type="button" class="remove-criteria-btn" onclick="removeCriteria(this)">✕ Remove</button>
            </div>
            <div class="criteria-fields">
                <div class="form-group">
                    <label class="form-label">Criteria Name</label>
                    <input type="text" class="form-input criteria-name-input" placeholder="e.g., Grammar and Mechanics">
                </div>
                <div class="form-group">
                    <label class="form-label">Weight (%)</label>
                    <input type="number" class="form-input criteria-weight-input" placeholder="25" min="1" max="100">
                </div>
                <div class="form-group criteria-description">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea criteria-description-input" placeholder="Describe what this criteria evaluates..." rows="2"></textarea>
                </div>
            </div>
            <div class="performance-levels">
                <div class="performance-level excellent">
                    <h5>Excellent (4)</h5>
                    <textarea class="form-textarea performance-input" placeholder="Description for excellent performance..." rows="3"></textarea>
                </div>
                <div class="performance-level good">
                    <h5>Good (3)</h5>
                    <textarea class="form-textarea performance-input" placeholder="Description for good performance..." rows="3"></textarea>
                </div>
                <div class="performance-level satisfactory">
                    <h5>Satisfactory (2)</h5>
                    <textarea class="form-textarea performance-input" placeholder="Description for satisfactory performance..." rows="3"></textarea>
                </div>
                <div class="performance-level needs-improvement">
                    <h5>Needs Improvement (1)</h5>
                    <textarea class="form-textarea performance-input" placeholder="Description for needs improvement..." rows="3"></textarea>
                </div>
            </div>
        `;
        criteriaContainer.appendChild(criteriaItem);
    }
    
    function removeCriteria(button) {
        button.closest('.criteria-item').remove();
        updateCriteriaNumbers();
    }
    
    function updateCriteriaNumbers() {
        const criteriaItems = document.querySelectorAll('.criteria-item');
        criteriaItems.forEach((item, index) => {
            item.querySelector('.criteria-title').textContent = `Criteria ${index + 1}`;
        });
        rubricCounter = criteriaItems.length;
    }
    
    function clearRubricEditor() {
        document.getElementById('rubricName').value = '';
        document.getElementById('rubricDescription').value = '';
        document.getElementById('rubricCriteria').innerHTML = '';
        rubricCounter = 0;
    }
    
    function loadRubricTemplate() {
        clearRubricEditor();
        document.getElementById('rubricName').value = 'Essay Writing Rubric';
        document.getElementById('rubricDescription').value = 'Comprehensive rubric for evaluating student essays';
        
        // Add sample criteria
        addCriteria();
        addCriteria();
        addCriteria();
        
        // Fill in template data
        const criteriaItems = document.querySelectorAll('.criteria-item');
        const templateData = [
            {
                name: 'Content and Ideas',
                weight: '40',
                description: 'Quality of ideas, thesis development, and supporting evidence',
                levels: [
                    'Clear, focused thesis with strong supporting evidence and original insights',
                    'Good thesis with adequate supporting evidence and some original thinking',
                    'Basic thesis with limited supporting evidence and minimal original thought',
                    'Weak or unclear thesis with insufficient supporting evidence'
                ]
            },
            {
                name: 'Organization and Structure',
                weight: '30',
                description: 'Logical flow, paragraph structure, and transitions',
                levels: [
                    'Excellent organization with clear introduction, body, and conclusion',
                    'Good organization with mostly clear structure and transitions',
                    'Basic organization with some structural issues',
                    'Poor organization with unclear structure and weak transitions'
                ]
            },
            {
                name: 'Grammar and Mechanics',
                weight: '30',
                description: 'Grammar, punctuation, spelling, and sentence structure',
                levels: [
                    'Excellent grammar and mechanics with varied sentence structure',
                    'Good grammar with minor errors and some sentence variety',
                    'Basic grammar with several errors and limited sentence variety',
                    'Poor grammar with many errors and simple sentence structure'
                ]
            }
        ];
        
        criteriaItems.forEach((item, index) => {
            if (templateData[index]) {
                const data = templateData[index];
                item.querySelector('.criteria-name-input').value = data.name;
                item.querySelector('.criteria-weight-input').value = data.weight;
                item.querySelector('.criteria-description-input').value = data.description;
                
                const performanceInputs = item.querySelectorAll('.performance-input');
                performanceInputs.forEach((input, levelIndex) => {
                    if (data.levels[levelIndex]) {
                        input.value = data.levels[levelIndex];
                    }
                });
            }
        });
    }
    
    function saveRubric() {
        const name = document.getElementById('rubricName').value.trim();
        const description = document.getElementById('rubricDescription').value.trim();
        const criteriaItems = document.querySelectorAll('.criteria-item');
        
        if (!name) {
            alert('Please enter a rubric name.');
            return;
        }
        
        if (criteriaItems.length === 0) {
            alert('Please add at least one criteria.');
            return;
        }
        
        const criteria = [];
        let totalWeight = 0;
        
        criteriaItems.forEach(item => {
            const criteriaName = item.querySelector('.criteria-name-input').value.trim();
            const weight = parseInt(item.querySelector('.criteria-weight-input').value) || 0;
            const criteriaDescription = item.querySelector('.criteria-description-input').value.trim();
            const performanceInputs = item.querySelectorAll('.performance-input');
            
            if (!criteriaName) {
                alert('Please fill in all criteria names.');
                return;
            }
            
            const performanceLevels = [];
            performanceInputs.forEach(input => {
                performanceLevels.push(input.value.trim());
            });
            
            criteria.push({
                name: criteriaName,
                weight: weight,
                description: criteriaDescription,
                performanceLevels: performanceLevels
            });
            
            totalWeight += weight;
        });
        
        if (totalWeight !== 100) {
            alert(`Total weight must equal 100%. Current total: ${totalWeight}%`);
            return;
        }
        
        const rubric = {
            id: Date.now().toString(),
            name: name,
            description: description,
            criteria: criteria,
            createdAt: new Date().toISOString()
        };
        
        savedRubrics.push(rubric);
        localStorage.setItem('savedRubrics', JSON.stringify(savedRubrics));
        
        loadSavedRubrics();
        alert('Rubric saved successfully!');
    }
    
    function loadRubricIntoEditor(rubric) {
        clearRubricEditor();
        document.getElementById('rubricName').value = rubric.name;
        document.getElementById('rubricDescription').value = rubric.description;
        
        rubric.criteria.forEach(criteria => {
            addCriteria();
            const lastItem = document.querySelector('.criteria-item:last-child');
            lastItem.querySelector('.criteria-name-input').value = criteria.name;
            lastItem.querySelector('.criteria-weight-input').value = criteria.weight;
            lastItem.querySelector('.criteria-description-input').value = criteria.description;
            
            const performanceInputs = lastItem.querySelectorAll('.performance-input');
            performanceInputs.forEach((input, index) => {
                if (criteria.performanceLevels[index]) {
                    input.value = criteria.performanceLevels[index];
                }
            });
        });
        
        document.getElementById('rubricEditor').style.display = 'block';
    }
    
    function testRubric() {
        const selectedRubric = savedRubrics.find(r => r.id === document.getElementById('rubricSelect').value);
        if (!selectedRubric) {
            alert('Please select a rubric to test.');
            return;
        }
        
        // Use sample student work for testing
        const sampleWork = `The Impact of Technology on Education

Technology has revolutionized the way we learn and teach in modern society. From interactive whiteboards to online learning platforms, digital tools have transformed traditional educational methods.

One of the most significant benefits of technology in education is increased accessibility. Students can now access learning materials from anywhere in the world, breaking down geographical barriers. Online courses and virtual classrooms have made education more inclusive for students with disabilities or those living in remote areas.

However, there are also challenges associated with technology in education. The digital divide remains a significant issue, with some students lacking access to necessary devices or reliable internet connections. Additionally, there are concerns about screen time and its impact on students' attention spans and social skills.

In conclusion, while technology has brought many positive changes to education, it is important to address the challenges and ensure that all students can benefit from these advancements.`;
        
        // Generate rubric-based analysis
        generateRubricBasedReport('Test Student', 'Essay', sampleWork, selectedRubric);
        
        // Switch to individual tab to show results
        switchTab('individual');
    }
    
    function generateRubricBasedAnalysis(rubric, studentWork, assignmentType) {
        const analysis = {
            rubricName: rubric.name,
            criteriaScores: [],
            strengths: [],
            weaknesses: [],
            recommendations: {
                immediate: [],
                longterm: []
            }
        };
        
        // Analyze student work characteristics
        const workAnalysis = analyzeStudentWork(studentWork, assignmentType);
        
        // Calculate scores based on rubric criteria and work analysis
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        rubric.criteria.forEach(criteria => {
            const score = calculateCriteriaScore(criteria, workAnalysis, studentWork);
            const percentage = (score / 4) * 100;
            const weightedScore = (score / 4) * criteria.weight;
            
            totalWeightedScore += weightedScore;
            totalWeight += criteria.weight;
            
            analysis.criteriaScores.push({
                name: criteria.name,
                score: score,
                percentage: percentage,
                feedback: criteria.performanceLevels[score - 1] || 'No feedback available',
                weight: criteria.weight
            });
            
            // Generate strengths and weaknesses based on scores
            if (score >= 3) {
                analysis.strengths.push(generateStrengthFeedback(criteria.name, score, workAnalysis));
            } else {
                analysis.weaknesses.push(generateWeaknessFeedback(criteria.name, score, workAnalysis));
            }
        });
        
        // Calculate overall grade and percentage
        const overallPercentage = (totalWeightedScore / totalWeight) * 100;
        analysis.overallGrade = calculateGradeFromPercentage(overallPercentage);
        analysis.percentage = Math.round(overallPercentage) + '%';
        
        // Generate recommendations based on rubric and scores
        analysis.recommendations = generateRubricRecommendations(analysis.criteriaScores, rubric);
        
        return analysis;
    }
    
    function analyzeStudentWork(studentWork, assignmentType) {
        const wordCount = studentWork.split(' ').length;
        const sentenceCount = studentWork.split('.').length;
        const paragraphCount = studentWork.split('\n\n').length;
        const avgWordsPerSentence = wordCount / sentenceCount;
        
        // Analyze writing quality indicators
        const hasThesis = /thesis|argument|claim|position/i.test(studentWork);
        const hasEvidence = /because|therefore|evidence|example|support/i.test(studentWork);
        const hasTransitions = /however|moreover|furthermore|additionally|consequently/i.test(studentWork);
        const hasConclusion = /conclusion|summary|finally|in conclusion/i.test(studentWork);
        
        // Check for common writing issues
        const grammarIssues = countGrammarIssues(studentWork);
        const spellingIssues = countSpellingIssues(studentWork);
        const punctuationIssues = countPunctuationIssues(studentWork);
        
        return {
            wordCount,
            sentenceCount,
            paragraphCount,
            avgWordsPerSentence,
            hasThesis,
            hasEvidence,
            hasTransitions,
            hasConclusion,
            grammarIssues,
            spellingIssues,
            punctuationIssues,
            assignmentType
        };
    }
    
    function calculateCriteriaScore(criteria, workAnalysis, studentWork) {
        const criteriaName = criteria.name.toLowerCase();
        let score = 2; // Start with satisfactory (2)
        
        if (criteriaName.includes('content') || criteriaName.includes('ideas')) {
            score = calculateContentScore(workAnalysis, studentWork);
        } else if (criteriaName.includes('organization') || criteriaName.includes('structure')) {
            score = calculateOrganizationScore(workAnalysis, studentWork);
        } else if (criteriaName.includes('grammar') || criteriaName.includes('mechanics')) {
            score = calculateGrammarScore(workAnalysis, studentWork);
        } else if (criteriaName.includes('creativity') || criteriaName.includes('originality')) {
            score = calculateCreativityScore(workAnalysis, studentWork);
        } else if (criteriaName.includes('research') || criteriaName.includes('evidence')) {
            score = calculateResearchScore(workAnalysis, studentWork);
        } else {
            // Generic scoring based on overall quality
            score = calculateGenericScore(workAnalysis, studentWork);
        }
        
        return Math.max(1, Math.min(4, score)); // Ensure score is between 1-4
    }
    
    function calculateContentScore(workAnalysis, studentWork) {
        let score = 2;
        
        if (workAnalysis.hasThesis) score += 1;
        if (workAnalysis.hasEvidence) score += 1;
        if (workAnalysis.wordCount > 200) score += 0.5;
        if (workAnalysis.wordCount > 400) score += 0.5;
        
        // Check for depth of analysis
        const analysisWords = ['analyze', 'examine', 'evaluate', 'compare', 'contrast', 'discuss'];
        const hasAnalysis = analysisWords.some(word => studentWork.toLowerCase().includes(word));
        if (hasAnalysis) score += 0.5;
        
        return Math.round(score);
    }
    
    function calculateOrganizationScore(workAnalysis, studentWork) {
        let score = 2;
        
        if (workAnalysis.hasTransitions) score += 1;
        if (workAnalysis.hasConclusion) score += 1;
        if (workAnalysis.paragraphCount >= 3) score += 0.5;
        if (workAnalysis.avgWordsPerSentence > 12) score += 0.5;
        
        return Math.round(score);
    }
    
    function calculateGrammarScore(workAnalysis, studentWork) {
        let score = 4; // Start high and deduct for issues
        
        if (workAnalysis.grammarIssues > 5) score -= 1;
        if (workAnalysis.grammarIssues > 10) score -= 1;
        if (workAnalysis.spellingIssues > 3) score -= 1;
        if (workAnalysis.punctuationIssues > 5) score -= 1;
        
        return Math.max(1, score);
    }
    
    function calculateCreativityScore(workAnalysis, studentWork) {
        let score = 2;
        
        // Check for creative elements
        const creativeWords = ['imagine', 'creative', 'unique', 'original', 'innovative', 'inventive'];
        const hasCreative = creativeWords.some(word => studentWork.toLowerCase().includes(word));
        if (hasCreative) score += 1;
        
        if (workAnalysis.wordCount > 300) score += 0.5;
        if (workAnalysis.avgWordsPerSentence > 15) score += 0.5;
        
        return Math.round(score);
    }
    
    function calculateResearchScore(workAnalysis, studentWork) {
        let score = 2;
        
        if (workAnalysis.hasEvidence) score += 1;
        if (workAnalysis.wordCount > 250) score += 0.5;
        
        // Check for research indicators
        const researchWords = ['study', 'research', 'data', 'statistics', 'findings', 'according to'];
        const hasResearch = researchWords.some(word => studentWork.toLowerCase().includes(word));
        if (hasResearch) score += 1;
        
        return Math.round(score);
    }
    
    function calculateGenericScore(workAnalysis, studentWork) {
        let score = 2;
        
        if (workAnalysis.wordCount > 150) score += 0.5;
        if (workAnalysis.wordCount > 300) score += 0.5;
        if (workAnalysis.hasThesis) score += 0.5;
        if (workAnalysis.hasEvidence) score += 0.5;
        
        return Math.round(score);
    }
    
    function countGrammarIssues(text) {
        // Simple grammar issue detection
        const issues = [];
        if (!/^[A-Z]/.test(text.trim())) issues.push('capitalization');
        if (text.includes('  ')) issues.push('spacing');
        if (text.includes('alot')) issues.push('spelling');
        return issues.length;
    }
    
    function countSpellingIssues(text) {
        // Simple spelling issue detection
        const commonMisspellings = ['recieve', 'seperate', 'definately', 'occured'];
        return commonMisspellings.filter(word => text.toLowerCase().includes(word)).length;
    }
    
    function countPunctuationIssues(text) {
        // Simple punctuation issue detection
        let issues = 0;
        if (text.includes('..')) issues++;
        if (text.includes('!!')) issues++;
        if (text.includes('??')) issues++;
        return issues;
    }
    
    function generateStrengthFeedback(criteriaName, score, workAnalysis) {
        const strengths = {
            'content and ideas': [
                'Excellent development of ideas with strong supporting evidence',
                'Clear and focused thesis statement with compelling arguments',
                'Well-developed content with original insights and analysis',
                'Strong evidence and examples that support the main argument'
            ],
            'organization and structure': [
                'Excellent organization with clear introduction, body, and conclusion',
                'Strong logical flow with effective transitions between ideas',
                'Well-structured paragraphs with clear topic sentences',
                'Effective use of transitions to connect ideas smoothly'
            ],
            'grammar and mechanics': [
                'Excellent grammar and mechanics with varied sentence structure',
                'Strong command of language with sophisticated vocabulary',
                'Consistent and correct use of punctuation and capitalization',
                'Well-crafted sentences that enhance readability'
            ],
            'creativity and originality': [
                'Highly creative approach with original ideas and perspectives',
                'Innovative thinking demonstrated throughout the work',
                'Unique voice and style that engages the reader',
                'Creative use of language and expression'
            ],
            'research and evidence': [
                'Thorough research with strong supporting evidence',
                'Excellent use of credible sources and data',
                'Well-integrated evidence that strengthens the argument',
                'Comprehensive research that demonstrates deep understanding'
            ]
        };
        
        const criteriaKey = criteriaName.toLowerCase();
        const strengthList = strengths[criteriaKey] || strengths['content and ideas'];
        return strengthList[Math.min(score - 1, strengthList.length - 1)];
    }
    
    function generateWeaknessFeedback(criteriaName, score, workAnalysis) {
        const weaknesses = {
            'content and ideas': [
                'Limited development of ideas with insufficient supporting evidence',
                'Unclear or weak thesis statement that needs strengthening',
                'Basic content that lacks depth and original analysis',
                'Insufficient evidence to support the main argument'
            ],
            'organization and structure': [
                'Poor organization with unclear structure and flow',
                'Weak transitions that make the writing difficult to follow',
                'Unclear paragraph structure without strong topic sentences',
                'Lack of effective transitions between ideas'
            ],
            'grammar and mechanics': [
                'Multiple grammar and mechanics errors that affect readability',
                'Limited vocabulary and simple sentence structure',
                'Inconsistent punctuation and capitalization',
                'Frequent errors that distract from the content'
            ],
            'creativity and originality': [
                'Limited creativity with conventional ideas and approaches',
                'Lack of original thinking and unique perspectives',
                'Generic voice and style that lacks engagement',
                'Minimal creative use of language and expression'
            ],
            'research and evidence': [
                'Insufficient research with limited supporting evidence',
                'Weak or unreliable sources that don\'t support the argument',
                'Poor integration of evidence into the main argument',
                'Limited research that shows superficial understanding'
            ]
        };
        
        const criteriaKey = criteriaName.toLowerCase();
        const weaknessList = weaknesses[criteriaKey] || weaknesses['content and ideas'];
        return weaknessList[Math.min(4 - score, weaknessList.length - 1)];
    }
    
    function calculateGradeFromPercentage(percentage) {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 63) return 'D';
        if (percentage >= 60) return 'D-';
        return 'F';
    }
    
    function generateRubricRecommendations(criteriaScores, rubric) {
        const recommendations = {
            immediate: [],
            longterm: []
        };
        
        criteriaScores.forEach(criteria => {
            if (criteria.score <= 2) {
                // Low scores need immediate attention
                recommendations.immediate.push(generateImmediateRecommendation(criteria.name, criteria.score));
            }
            if (criteria.score <= 3) {
                // Medium scores need long-term improvement
                recommendations.longterm.push(generateLongTermRecommendation(criteria.name, criteria.score));
            }
        });
        
        return recommendations;
    }
    
    function generateImmediateRecommendation(criteriaName, score) {
        const recommendations = {
            'content and ideas': 'Focus on developing a clear thesis statement and providing more supporting evidence',
            'organization and structure': 'Work on improving paragraph structure and adding transitions between ideas',
            'grammar and mechanics': 'Review grammar rules and practice proper punctuation and capitalization',
            'creativity and originality': 'Try to incorporate more original ideas and creative approaches',
            'research and evidence': 'Include more credible sources and evidence to support your arguments'
        };
        
        const criteriaKey = criteriaName.toLowerCase();
        return recommendations[criteriaKey] || 'Focus on improving this area with more practice and attention to detail';
    }
    
    function generateLongTermRecommendation(criteriaName, score) {
        const recommendations = {
            'content and ideas': 'Continue developing critical thinking skills and analytical writing abilities',
            'organization and structure': 'Practice outlining and structuring essays to improve organization',
            'grammar and mechanics': 'Regular grammar practice and reading to improve language skills',
            'creativity and originality': 'Engage in creative writing exercises to develop original thinking',
            'research and evidence': 'Develop research skills and learn to evaluate source credibility'
        };
        
        const criteriaKey = criteriaName.toLowerCase();
        return recommendations[criteriaKey] || 'Continue practicing and developing skills in this area';
    }
    
    function generateRubricBasedReport(studentName, assignmentType, studentWork, rubric) {
        const analysis = generateRubricBasedAnalysis(rubric, studentWork, assignmentType);
        showRubricBasedReport(analysis, rubric, studentName, assignmentType);
    }
    
    function showRubricBasedReport(analysis, rubric, studentName = 'Sample Student', assignmentType = 'Rubric Assessment') {
        // Update report header
        document.getElementById('reportStudentName').textContent = studentName;
        document.getElementById('reportAssignmentType').textContent = `${assignmentType} (${rubric.name})`;
        document.getElementById('analysisDate').textContent = new Date().toLocaleDateString();
        
        // Update grade
        document.getElementById('overallGrade').textContent = analysis.overallGrade;
        document.querySelector('.grade-percentage').textContent = analysis.percentage;
        
        // Update strengths
        const strengthsList = document.getElementById('strengthsList');
        strengthsList.innerHTML = '';
        analysis.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
        
        // Update weaknesses
        const weaknessesList = document.getElementById('weaknessesList');
        weaknessesList.innerHTML = '';
        analysis.weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.textContent = weakness;
            weaknessesList.appendChild(li);
        });
        
        // Update recommendations
        const recommendationsContent = document.getElementById('recommendationsContent');
        recommendationsContent.innerHTML = `
            <p><strong>Rubric-Based Assessment:</strong> ${rubric.name}</p>
            <p><strong>Criteria Breakdown:</strong></p>
            <ul>
                ${analysis.criteriaScores.map(criteria => 
                    `<li><strong>${criteria.name}:</strong> ${criteria.score}/4 (${criteria.percentage}%) - ${criteria.feedback}</li>`
                ).join('')}
            </ul>
            <p><strong>Immediate Actions:</strong></p>
            <ul>
                ${analysis.recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            <p><strong>Long-term Goals:</strong></p>
            <ul>
                ${analysis.recommendations.longterm.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
        
        // Show report
        document.getElementById('reportPlaceholder').style.display = 'none';
        document.getElementById('progressReport').style.display = 'block';
        
        // Scroll to report
        document.getElementById('progressReport').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Initialize rubric system
    initializeRubricSystem();
    
    // Sample data for demonstration
    const sampleReports = {
        essay: {
            grade: 'B+',
            percentage: '85%',
            strengths: [
                'Clear and well-structured arguments',
                'Strong vocabulary and writing style',
                'Good use of supporting evidence',
                'Creative problem-solving approach'
            ],
            weaknesses: [
                'Grammar and punctuation errors',
                'Could benefit from more detailed examples',
                'Conclusion needs strengthening',
                'Time management in longer assignments'
            ],
            recommendations: {
                immediate: [
                    'Review grammar rules and practice punctuation',
                    'Work on developing stronger conclusions'
                ],
                longterm: [
                    'Practice time management techniques',
                    'Expand vocabulary through reading'
                ]
            }
        },
        project: {
            grade: 'A-',
            percentage: '92%',
            strengths: [
                'Excellent research and data collection',
                'Creative presentation format',
                'Strong collaboration skills',
                'Thorough documentation'
            ],
            weaknesses: [
                'Could improve time management',
                'Needs more critical analysis',
                'Presentation could be more engaging'
            ],
            recommendations: {
                immediate: [
                    'Focus on critical thinking skills',
                    'Practice presentation techniques'
                ],
                longterm: [
                    'Develop project management skills',
                    'Enhance analytical thinking'
                ]
            }
        },
        homework: {
            grade: 'B',
            percentage: '82%',
            strengths: [
                'Consistent effort and completion',
                'Good understanding of concepts',
                'Neat and organized work',
                'Shows improvement over time'
            ],
            weaknesses: [
                'Some calculation errors',
                'Could show more detailed work',
                'Needs to double-check answers'
            ],
            recommendations: {
                immediate: [
                    'Review calculation methods',
                    'Show all work steps clearly'
                ],
                longterm: [
                    'Develop better checking habits',
                    'Practice problem-solving strategies'
                ]
            }
        },
        quiz: {
            grade: 'C+',
            percentage: '78%',
            strengths: [
                'Good understanding of basic concepts',
                'Attempted all questions',
                'Shows logical thinking process'
            ],
            weaknesses: [
                'Needs more practice with complex problems',
                'Time management during tests',
                'Some fundamental concepts need review'
            ],
            recommendations: {
                immediate: [
                    'Review fundamental concepts',
                    'Practice time management'
                ],
                longterm: [
                    'Regular practice with similar problems',
                    'Develop test-taking strategies'
                ]
            }
        },
        presentation: {
            grade: 'A',
            percentage: '95%',
            strengths: [
                'Excellent public speaking skills',
                'Well-organized content',
                'Engaging visual aids',
                'Confident delivery'
            ],
            weaknesses: [
                'Could include more audience interaction',
                'Slightly rushed conclusion'
            ],
            recommendations: {
                immediate: [
                    'Practice audience engagement techniques',
                    'Work on pacing and timing'
                ],
                longterm: [
                    'Continue developing presentation skills',
                    'Explore different presentation formats'
                ]
            }
        }
    };

    // Form submission handler
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(uploadForm);
        const studentName = formData.get('studentName');
        const assignmentType = formData.get('assignmentType');
        const studentWork = formData.get('studentWork');
        const selectedRubric = formData.get('rubricSelectIndividual');
        
        // Validate form
        if (!studentName || !assignmentType || !studentWork) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        // Simulate AI analysis delay
        setTimeout(() => {
            if (selectedRubric && selectedRubric !== 'default') {
                // Use rubric-based analysis
                const rubric = savedRubrics.find(r => r.id === selectedRubric);
                if (rubric) {
                    generateRubricBasedReport(studentName, assignmentType, studentWork, rubric);
                } else {
                    generateReport(studentName, assignmentType, studentWork);
                }
            } else {
                // Use default AI analysis
                generateReport(studentName, assignmentType, studentWork);
            }
            hideLoadingState();
        }, 2000);
    });

    // Show loading state
    function showLoadingState() {
        analyzeBtn.classList.add('loading');
        analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span>Analyzing...';
        analyzeBtn.disabled = true;
    }

    // Hide loading state
    function hideLoadingState() {
        analyzeBtn.classList.remove('loading');
        analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span>Analyze Work';
        analyzeBtn.disabled = false;
    }

    // Generate progress report
    function generateReport(studentName, assignmentType, studentWork) {
        // Get sample data based on assignment type
        const reportData = sampleReports[assignmentType] || sampleReports.essay;
        
        // Update report header
        document.getElementById('reportStudentName').textContent = studentName;
        document.getElementById('reportAssignmentType').textContent = 
            assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1);
        document.getElementById('analysisDate').textContent = 
            new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        
        // Update grade
        document.getElementById('overallGrade').textContent = reportData.grade;
        document.querySelector('.grade-percentage').textContent = reportData.percentage;
        
        // Update strengths
        const strengthsList = document.getElementById('strengthsList');
        strengthsList.innerHTML = '';
        reportData.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
        
        // Update weaknesses
        const weaknessesList = document.getElementById('weaknessesList');
        weaknessesList.innerHTML = '';
        reportData.weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.textContent = weakness;
            weaknessesList.appendChild(li);
        });
        
        // Update recommendations
        const recommendationsContent = document.getElementById('recommendationsContent');
        recommendationsContent.innerHTML = `
            <p><strong>Immediate Actions:</strong></p>
            <ul>
                ${reportData.recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            <p><strong>Long-term Goals:</strong></p>
            <ul>
                ${reportData.recommendations.longterm.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
        
        // Show report and hide placeholder
        reportPlaceholder.style.display = 'none';
        progressReport.style.display = 'block';
        
        // Scroll to report
        progressReport.scrollIntoView({ behavior: 'smooth' });
        
        // Add success animation
        progressReport.style.animation = 'fadeIn 0.5s ease-in';
    }

    // Add drag and drop functionality for file uploads
    const uploadArea = document.querySelector('.upload-area');
    const textarea = document.getElementById('studentWork');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f0f2ff';
    }
    
    function unhighlight(e) {
        uploadArea.style.borderColor = '#dee2e6';
        uploadArea.style.backgroundColor = '#f8f9fa';
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            
            // Check if it's a text file
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    textarea.value = e.target.result;
                };
                reader.readAsText(file);
            } else {
                alert('Please upload a text file (.txt) or paste the content directly.');
            }
        }
    }

    // Add form validation feedback
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (uploadForm.checkValidity()) {
                uploadForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Add print functionality for reports
    function addPrintButton() {
        const reportHeader = document.querySelector('.report-header');
        if (reportHeader && !document.getElementById('printBtn')) {
            const printBtn = document.createElement('button');
            printBtn.id = 'printBtn';
            printBtn.innerHTML = '🖨️ Print Report';
            printBtn.className = 'print-btn';
            printBtn.style.cssText = `
                background: #28a745;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-left: auto;
            `;
            printBtn.onclick = () => window.print();
            reportHeader.style.display = 'flex';
            reportHeader.style.alignItems = 'center';
            reportHeader.appendChild(printBtn);
        }
    }

    // Show print button when report is generated
    const originalGenerateReport = generateReport;
    generateReport = function(...args) {
        originalGenerateReport.apply(this, args);
        setTimeout(addPrintButton, 100);
        setTimeout(addCompassUploadButton, 100);
    };

    // Add Compass upload functionality
    function addCompassUploadButton() {
        const compassUploadBtn = document.getElementById('compassUploadBtn');
        const compassStatus = document.getElementById('compassStatus');
        
        if (compassUploadBtn && !compassUploadBtn.hasAttribute('data-listener-added')) {
            compassUploadBtn.setAttribute('data-listener-added', 'true');
            
            compassUploadBtn.addEventListener('click', function() {
                // Show loading state
                compassUploadBtn.disabled = true;
                compassUploadBtn.innerHTML = '<span class="btn-icon">⏳</span>Uploading...';
                compassStatus.style.display = 'flex';
                
                // Simulate upload process
                setTimeout(() => {
                    // Show success state
                    compassStatus.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Successfully uploaded to Compass!</span>';
                    compassStatus.style.color = '#28a745';
                    
                    // Reset button after a delay
                    setTimeout(() => {
                        compassUploadBtn.disabled = false;
                        compassUploadBtn.innerHTML = '<span class="btn-icon">📤</span>Upload to Compass';
                        compassStatus.style.display = 'none';
                        compassStatus.style.color = '#17a2b8';
                        compassStatus.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Uploading to Compass...</span>';
                    }, 3000);
                }, 2000);
            });
        }
    }
});

// Utility function to format text for better readability
function formatText(text) {
    return text
        .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
        .trim();
}

// Add some sample data for quick testing
function loadSampleData() {
    document.getElementById('studentName').value = 'Sarah Johnson';
    document.getElementById('assignmentType').value = 'essay';
    document.getElementById('studentWork').value = `The Impact of Technology on Education

Technology has revolutionized the way we learn and teach in modern society. From interactive whiteboards to online learning platforms, digital tools have transformed traditional educational methods.

One of the most significant benefits of technology in education is increased accessibility. Students can now access learning materials from anywhere in the world, breaking down geographical barriers. Online courses and virtual classrooms have made education more inclusive for students with disabilities or those living in remote areas.

However, there are also challenges associated with technology in education. The digital divide remains a significant issue, with some students lacking access to necessary devices or reliable internet connections. Additionally, there are concerns about screen time and its impact on students' attention spans and social skills.

In conclusion, while technology has brought many positive changes to education, it is important to address the challenges and ensure that all students can benefit from these advancements.`;
}

// Add a "Load Sample" button for testing
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.upload-form');
    const loadSampleBtn = document.createElement('button');
    loadSampleBtn.type = 'button';
    loadSampleBtn.innerHTML = '📝 Load Sample Data';
    loadSampleBtn.className = 'load-sample-btn';
    loadSampleBtn.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        margin-left: 1rem;
    `;
    loadSampleBtn.onclick = loadSampleData;
    
    // Add sample photo button
    const loadSamplePhotoBtn = document.createElement('button');
    loadSamplePhotoBtn.type = 'button';
    loadSamplePhotoBtn.innerHTML = '📷 Load Sample Photo';
    loadSamplePhotoBtn.className = 'load-sample-photo-btn';
    loadSamplePhotoBtn.style.cssText = `
        background: #17a2b8;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        margin-left: 1rem;
    `;
    loadSamplePhotoBtn.onclick = loadSamplePhoto;
    
    const submitBtn = document.getElementById('analyzeBtn');
    submitBtn.parentNode.insertBefore(loadSampleBtn, submitBtn);
    submitBtn.parentNode.insertBefore(loadSamplePhotoBtn, submitBtn);
});

// Load sample photo for demonstration
function loadSamplePhoto() {
    // Create a sample image (handwritten essay)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some lines to simulate handwriting
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = '16px Arial';
    
    // Draw some text lines
    const lines = [
        'The Impact of Technology on Education',
        '',
        'Technology has revolutionized the way we learn',
        'and teach in modern society. From interactive',
        'whiteboards to online learning platforms,',
        'digital tools have transformed traditional',
        'educational methods.',
        '',
        'One of the most significant benefits is',
        'increased accessibility for students...'
    ];
    
    let y = 30;
    lines.forEach(line => {
        ctx.fillText(line, 20, y);
        y += 20;
    });
    
    // Convert canvas to blob and create file
    canvas.toBlob(function(blob) {
        const file = new File([blob], 'sample-essay.jpg', { type: 'image/jpeg' });
        
        // Set the file to the photo upload input
        const photoUpload = document.getElementById('photoUpload');
        if (photoUpload) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            photoUpload.files = dataTransfer.files;
            photoUpload.dispatchEvent(new Event('change'));
        }
    }, 'image/jpeg');
}
