//https://chatgpt.com/c/67a08049-2c28-8003-aed4-9c9e40bf4bbf
//https://script.google.com/macros/s/AKfycbwufvGNhMqTpEaP9dIQ6YMipBtE44HvhJirIm5ziFkJHPV9RM_ZjnDfP0mTke8YK_yD/exec


function doGet() {
  return HtmlService.createHtmlOutputFromFile('index'); // Adjust if your HTML is in a different file
}

function getAreas() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
  var data = sheet.getRange('A2:A').getValues();
  
  // Extract non-empty values into an array
  var areas = data.filter(function(row) {
    return row[0] !== '';
  }).map(function(row) {
    return row[0];
  });
  
  return areas;
}

function checkReferenceNumber(reference) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
  var data = sheet.getRange('B2:B').getValues();  // Get data from column B in Sheet2
  
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == reference) {
      return true;  // Valid reference number
    }
  }
  
  return false;  // Invalid reference number
}

function checkPhoneAndSubmit(id, name, address, phone, area, reference, time, latitude, longitude) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var data = sheet.getDataRange().getValues();
  
  // Check if the phone number already exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == phone) {  // Assuming phone is in the 3rd column (C)
      return 'Phone number already exists';
    }
  }

  // Append new row with time included
  sheet.appendRow([id, name, address, phone, area, reference, time, latitude, longitude]);
  return 'success';
}
------------------------------
<!DOCTYPE html>
<html>
<head>
  <title>Entry Form</title>
  <style>
    #latitude, #longitude, #id, #time {
      display: none;
    }
  </style>
</head>
<body>
  <h1>Entry Form</h1>
  <form id="entryForm">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required><br><br>
    
    <label for="address">Address:</label>
    <input type="text" id="address" name="address" required><br><br>
    
    <label for="phone">Phone (Unique):</label>
    <input type="text" id="phone" name="phone" required><br><br>
    
    <label for="area">Area:</label>
    <select id="area" name="area" required>
      <option value="">Select an area</option>
    </select><br><br>

    <label for="reference">Reference Number:</label>
    <input type="number" id="reference" name="reference" required><br><br>
    
    <!-- Hidden Fields for ID, Time, Latitude, Longitude -->
    <input type="text" id="id" name="id" readonly><br>
    <input type="text" id="time" name="time" readonly><br>
    <input type="text" id="latitude" name="latitude" readonly><br>
    <input type="text" id="longitude" name="longitude" readonly><br><br>
    
    <button type="submit">Submit</button>
  </form>

  <script>
    // Function to get current date-time in UTC+6
    function getCurrentTime() {
      let now = new Date();
      now.setHours(now.getHours() + 6); // Convert to UTC+6
      return now.toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:MM:SS
    }

    // Load area options and set fields on page load
    window.onload = function() {
      google.script.run.withSuccessHandler(function(areas) {
        var areaSelect = document.getElementById('area');
        areas.forEach(function(area) {
          var option = document.createElement('option');
          option.value = area;
          option.textContent = area;
          areaSelect.appendChild(option);
        });

        // Get the user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;
          }, function(error) {
            alert("Error getting location: " + error.message);
          });
        } else {
          alert("Geolocation is not supported by this browser.");
        }

        // Auto-generate a unique ID using timestamp
        document.getElementById('id').value = 'ID-' + new Date().getTime();

      }).getAreas();
    };

    document.getElementById('entryForm').addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('time').value = getCurrentTime(); // Set current UTC+6 time before submission

      const id = document.getElementById('id').value;
      const name = document.getElementById('name').value;
      const address = document.getElementById('address').value;
      const phone = document.getElementById('phone').value;
      const area = document.getElementById('area').value;
      const reference = document.getElementById('reference').value;
      const time = document.getElementById('time').value;
      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;

      // Check if the reference number matches in Sheet2
      google.script.run.withSuccessHandler(function(isValidReference) {
        if (!isValidReference) {
          alert("Invalid Reference Number.");
          return;
        }
        
        google.script.run.withSuccessHandler(function(response) {
          if(response === 'success') {
            alert('Entry successfully added!');
            document.getElementById('entryForm').reset(); // Clear the form fields
          } else {
            alert('Phone number already exists!');
          }
        }).withFailureHandler(function(error) {
          alert('Error: ' + error.message);
        }).checkPhoneAndSubmit(id, name, address, phone, area, reference, time, latitude, longitude);
      }).checkReferenceNumber(reference);
    });
  </script>
</body>
</html>









