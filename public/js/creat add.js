    let currentStep = 1;
    let selectedInsurance = 'none';
    let selectedBoost = 'none';
    let uploadedImages = [];

    // Theme toggle functionality
    function toggleTheme() {
      const body = document.body;
      const themeIcon = document.getElementById('theme-icon');
      const currentTheme = body.getAttribute('data-theme');
      
      if (currentTheme === 'light') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        showNotification('Switched to dark theme', 'success');
      } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        showNotification('Switched to light theme', 'success');
      }
    }

    // Notification
    function showNotification(message, type = 'info') {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification show ${type}`;
      setTimeout(() => {
        notification.className = 'notification';
      }, 2500);
    }

    // Step navigation
    function showStep(step) {
      for (let i = 1; i <= 4; i++) {
        document.getElementById('step' + i).classList.remove('active');
        document.getElementById('step' + i + 'Circle').classList.remove('active', 'completed');
        document.getElementById('step' + i + 'Label').classList.remove('active');
      }
      document.getElementById('step' + step).classList.add('active');
      document.getElementById('step' + step + 'Circle').classList.add('active');
      document.getElementById('step' + step + 'Label').classList.add('active');
      for (let i = 1; i < step; i++) {
        document.getElementById('step' + i + 'Circle').classList.add('completed');
      }
      // Progress line
      const progressLine = document.getElementById('progressLine');
      progressLine.style.width = ((step - 1) / 3) * 100 + '%';

      // Buttons
      document.getElementById('prevBtn').style.display = step > 1 ? '' : 'none';
      document.getElementById('nextBtn').style.display = step < 4 ? '' : 'none';
      document.getElementById('submitBtn').style.display = step === 4 ? '' : 'none';
      document.getElementById('downloadBtn').style.display = step === 4 ? '' : 'none';
    }

    function nextStep() {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep < 4) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === 4) updateContractPreview();
      }
    }

    function previousStep() {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    }

    // Step 1 validation
    function validateStep1() {
      const title = document.getElementById('productTitle').value.trim();
      const category = document.getElementById('productCategory').value;
      const desc = document.getElementById('productDescription').value.trim();
      const price = document.getElementById('dailyPrice').value;
      const location = document.getElementById('location').value.trim();
      if (!title || !category || !desc || !price || !location || uploadedImages.length === 0) {
        showNotification('Please fill all required fields and upload at least one image.', 'error');
        return false;
      }
      return true;
    }

    // Insurance selection
    function selectInsurance(type) {
      selectedInsurance = type;
      document.querySelectorAll('.insurance-card').forEach(card => card.classList.remove('selected'));
      if (type === 'none') document.querySelectorAll('.insurance-card')[0].classList.add('selected');
      if (type === 'basic') document.querySelectorAll('.insurance-card')[1].classList.add('selected');
      if (type === 'premium') document.querySelectorAll('.insurance-card')[2].classList.add('selected');
    }

    // Boost selection
    function selectBoost(type) {
      selectedBoost = type;
      document.querySelectorAll('.boost-card').forEach(card => card.classList.remove('selected'));
      if (type === 'none') document.querySelectorAll('.boost-card')[0].classList.add('selected');
      if (type === 'featured') document.querySelectorAll('.boost-card')[1].classList.add('selected');
      if (type === 'premium') document.querySelectorAll('.boost-card')[2].classList.add('selected');
      if (type === 'spotlight') document.querySelectorAll('.boost-card')[3].classList.add('selected');
    }

    // Image upload
    document.getElementById('imageInput').addEventListener('change', function (e) {
      const files = Array.from(e.target.files);
      if (uploadedImages.length + files.length > 8) {
        showNotification('Maximum 8 images allowed.', 'error');
        return;
      }
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (event) {
          uploadedImages.push(event.target.result);
          updateImagePreview();
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    });

    function updateImagePreview() {
      const preview = document.getElementById('imagePreview');
      preview.innerHTML = '';
      uploadedImages.forEach((src, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
          <img src="${src}" class="preview-image" />
          <button class="remove-image" onclick="removeImage(${idx})"><i class="fas fa-times"></i></button>
        `;
        preview.appendChild(div);
      });
    }

    function removeImage(idx) {
      uploadedImages.splice(idx, 1);
      updateImagePreview();
    }

    // Drag & drop for image upload
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('dragover', function (e) {
      e.preventDefault();
      imageUpload.classList.add('dragover');
    });
    imageUpload.addEventListener('dragleave', function () {
      imageUpload.classList.remove('dragover');
    });
    imageUpload.addEventListener('drop', function (e) {
      e.preventDefault();
      imageUpload.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      if (uploadedImages.length + files.length > 8) {
        showNotification('Maximum 8 images allowed.', 'error');
        return;
      }
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (event) {
          uploadedImages.push(event.target.result);
          updateImagePreview();
        };
        reader.readAsDataURL(file);
      });
    });

    // Contract preview update
    function updateContractPreview() {
      document.getElementById('contractItem').textContent = document.getElementById('productTitle').value || '-';
      document.getElementById('contractOwner').textContent = 'You';
      document.getElementById('contractPrice').textContent = document.getElementById('dailyPrice').value || '-';
      document.getElementById('contractLocation').textContent = document.getElementById('location').value || '-';
      let insuranceText = 'None';
      if (selectedInsurance === 'basic') insuranceText = 'Basic Protection';
      if (selectedInsurance === 'premium') insuranceText = 'Premium Protection';
      document.getElementById('contractInsurance').textContent = insuranceText;
      let boostText = 'Standard';
      if (selectedBoost === 'featured') boostText = 'Featured';
      if (selectedBoost === 'premium') boostText = 'Premium';
      if (selectedBoost === 'spotlight') boostText = 'Spotlight';
      document.getElementById('contractBoost').textContent = boostText;
    }

    // Submit ad
    function submitAd() {
      showNotification('Your ad has been posted!', 'success');
      // Here you would send data to your backend
      setTimeout(() => {
        window.location.href = 'profile-test1.html';
      }, 2000);
    }

    // Download contract as text
    function downloadContract() {
      // Get the contract HTML
      const contractElement = document.querySelector('.contract-preview');
      // Extract text content
      const contractText = contractElement.innerText || contractElement.textContent;
      // Create a Blob with the text
      const blob = new Blob([contractText], { type: 'text/plain' });
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'KRILI_Rental_Contract.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Contract downloaded as text!', 'success');
    }

    // Logout
    function logout() {
      showNotification('Logging out...', 'info');
      setTimeout(() => {
        window.location.href = 'login-test1.html';
      }, 1000);
    }

    // Initialize
    window.onload = function () {
      showStep(currentStep);
      selectInsurance('none');
      selectBoost('none');
    };