// Bangladesh UGC grading mapping and CGPA calculator
document.addEventListener('DOMContentLoaded', ()=>{
  const tbody = document.getElementById('courses-body');
  const addBtn = document.getElementById('add-course');
  const calcBtn = document.getElementById('calc-cgpa');
  const clearBtn = document.getElementById('clear-all');
  const resultDiv = document.getElementById('result');
  const resultView = document.getElementById('result-view');
  const gradingSystem = document.getElementById('grading-system');
  const courseEntry = document.getElementById('course-entry');
  const semesterEntry = document.getElementById('semester-entry');
  const semesterBody = document.getElementById('semester-body');
  const addSemesterBtn = document.getElementById('add-semester');
  const calculateSemestersBtn = document.getElementById('calculate-semesters');

  function currentGradingSystem(){
    return gradingSystem?.value || 'UGC';
  }

  function addSemesterRow(number=1, credits='', sgpa=''){
    const row = document.createElement('tr');
    row.innerHTML = `<td><input class="semester-name" placeholder="1st Semester" value="${semesterName(number)}" /></td>
      <td><input class="semester-credits" type="number" min="0" step="0.5" placeholder="Enter credits" value="${credits}" /></td>
      <td><input class="semester-sgpa" type="number" min="0" max="4" step="0.01" placeholder="Enter SGPA" value="${sgpa}" /></td>
      <td><button class="remove-semester">Remove</button></td>`;
    row.querySelector('.remove-semester').addEventListener('click', ()=> row.remove());
    semesterBody.appendChild(row);
  }

  function addRow(name='', semester=1, credits=3, marks=0){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="name" placeholder="Course Name" value="${name}" /></td>
      <td class="course-entry-hidden"><input class="semester" type="number" min="1" step="1" value="${semester}" /></td>
      <td><input class="credit" type="number" min="0" step="0.5" value="${credits}" /></td>
      <td class="course-entry-hidden"><input class="marks" type="number" min="0" max="100" value="${marks}" /></td>
      <td><select class="grade">
        <option>A+</option><option>A</option><option>A-</option><option>B+</option>
        <option>B</option><option>B-</option><option>C+</option><option>C</option>
        <option>D</option><option>F</option>
      </select></td>
      <td class="point">-</td>
      <td><button class="remove">Remove</button></td>
    `;
    tr.querySelector('.grade').value = gradeFromMark(marks, currentGradingSystem()).letter;
    tr.querySelector('.remove').addEventListener('click', ()=> tr.remove());
    tbody.appendChild(tr);
    return tr;
  }

  function gradeFromMark_UGC(m){
    m = Number(m);
    if(isNaN(m) || m<0) return {letter:'F', point:0};
    if(m>=80) return {letter:'A+', point:4.00};
    if(m>=75) return {letter:'A', point:3.75};
    if(m>=70) return {letter:'A-', point:3.50};
    if(m>=65) return {letter:'B+', point:3.25};
    if(m>=60) return {letter:'B', point:3.00};
    if(m>=55) return {letter:'B-', point:2.75};
    if(m>=50) return {letter:'C+', point:2.50};
    if(m>=45) return {letter:'C', point:2.25};
    if(m>=40) return {letter:'D', point:2.00};
    return {letter:'F', point:0.00};
  }

  // DIU grading mapping (example mapping). Update if DIU uses different cutoffs.
  function gradeFromMark_DIU(m){
    m = Number(m);
    if(isNaN(m) || m<0) return {letter:'F', point:0};
    if(m>=80) return {letter:'A+', point:4.00};
    if(m>=75) return {letter:'A', point:3.75};
    if(m>=70) return {letter:'A-', point:3.50};
    if(m>=65) return {letter:'B+', point:3.25};
    if(m>=60) return {letter:'B', point:3.00};
    if(m>=55) return {letter:'B-', point:2.75};
    if(m>=50) return {letter:'C+', point:2.50};
    if(m>=45) return {letter:'C', point:2.25};
    if(m>=40) return {letter:'D', point:2.00};
    return {letter:'F', point:0.00};
  }

  function gradeFromMark(m, system){
    if(system === 'DIU') return gradeFromMark_DIU(m);
    return gradeFromMark_UGC(m);
  }

  function gradePoint(letter, system='UGC'){
    const gradeMap = {
      'A+': 4.00,
      A: 3.75,
      'A-': 3.50,
      'B+': 3.25,
      B: 3.00,
      'B-': 2.75,
      'C+': 2.50,
      C: 2.25,
      D: 2.00,
      F: 0.00
    };
    const normalized = String(letter || '').trim();
    if(system === 'DIU') return gradeMap[normalized] ?? 0.00;
    return gradeMap[normalized] ?? 0.00;
  }

  function semesterName(number){
    const suffix = number % 100 >= 11 && number % 100 <= 13
      ? 'th'
      : ({1:'st', 2:'nd', 3:'rd'}[number % 10] || 'th');
    return `${number}${suffix} Semester`;
  }

  function calculate(){
    if(resultView?.value === 'semester') return calculateSemesters();
    const rows = Array.from(tbody.querySelectorAll('tr'));
    let totalCredits = 0, totalWeighted = 0;
    const semesters = new Map();
    const system = currentGradingSystem();
    if(rows.length===0){ resultDiv.textContent = 'Add at least one course.'; return; }
    rows.forEach(row=>{
      const credit = parseFloat(row.querySelector('.credit').value) || 0;
      const semester = Math.max(1, parseInt(row.querySelector('.semester').value, 10) || 1);
      const grade = row.querySelector('.grade').value;
      const point = gradePoint(grade, system);
      row.querySelector('.point').textContent = point.toFixed(2);
      totalCredits += credit;
      totalWeighted += point * credit;
      const semesterTotal = semesters.get(semester) || {credits: 0, weighted: 0};
      semesterTotal.credits += credit;
      semesterTotal.weighted += point * credit;
      semesters.set(semester, semesterTotal);
    });
    if(totalCredits <= 0){ resultDiv.textContent = 'Total credits must be greater than 0.'; return; }
    const cgpa = totalWeighted / totalCredits;
    const view = resultView?.value || 'semester';
    resultDiv.innerHTML = `<div>Total Credits: ${totalCredits} &nbsp; | &nbsp; CGPA: <strong>${cgpa.toFixed(2)}</strong></div>`;
  }

  function calculateSemesters(){
    const rows = Array.from(semesterBody.querySelectorAll('tr'));
    let totalCredits = 0;
    let totalWeighted = 0;
    rows.forEach(row => {
      const name = row.querySelector('.semester-name').value || 'Semester';
      const credits = parseFloat(row.querySelector('.semester-credits').value) || 0;
      const sgpa = Math.min(4, Math.max(0, parseFloat(row.querySelector('.semester-sgpa').value) || 0));
      totalCredits += credits;
      totalWeighted += credits * sgpa;
    });
    const cgpa = totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : '0.00';
    resultDiv.innerHTML = `<div>Total Credits: ${totalCredits} &nbsp; | &nbsp; CGPA: <strong>${cgpa}</strong></div>`;
  }

  function updateView(){
    courseEntry.hidden = resultView?.value !== 'course';
    semesterEntry.hidden = resultView?.value !== 'semester';
    calculate();
  }

  addBtn.addEventListener('click', ()=> addRow('Course',1,3,0));
  calcBtn.addEventListener('click', calculate);
  addSemesterBtn.addEventListener('click', ()=> addSemesterRow(semesterBody.children.length + 1));
  calculateSemestersBtn.addEventListener('click', calculateSemesters);
  resultView?.addEventListener('change', updateView);
  gradingSystem?.addEventListener('change', ()=>{
    Array.from(tbody.querySelectorAll('tr')).forEach(row=>{
      const marksInput = row.querySelector('.marks');
      const gradeSelect = row.querySelector('.grade');
      if(!marksInput || !gradeSelect) return;
      gradeSelect.value = gradeFromMark(marksInput.value, currentGradingSystem()).letter;
    });
    calculate();
  });
  clearBtn.addEventListener('click', ()=>{ tbody.innerHTML=''; resultDiv.textContent=''; });

  // add one sample row
  addRow('Course 1',1,3,70);
  addSemesterRow();
  updateView();
});
