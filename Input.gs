//https://chatgpt.com/c/67a08049-2c28-8003-aed4-9c9e40bf4bbf
//https://script.google.com/macros/s/AKfycbx0EQMYF-eAXHe0BuGPe6rH8RTOR3ClE_kbTQ36SsPJFQePTix2yJKTOAFKYDELb5R0/exec
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
  
  // Check if the reference number exists in column B
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == reference) {
      return true;  // Valid reference number
    }
  }
  
  return false;  // Invalid reference number
}

function checkPhoneAndSubmit(id, name, address, phone, area, reference, latitude, longitude) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var data = sheet.getDataRange().getValues();
  
  // Check if the phone number already exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == phone) {  // Assuming phone is in the 3rd column (C)
      return 'Phone number already exists';
    }
  }

  // If phone is unique, append new entry with ID, area, reference, latitude, and longitude
  sheet.appendRow([id, name, address, phone, area, reference, latitude, longitude]);
  return 'success';
}
-------------------------------------
<!DOCTYPE html>
<html>
<head>
  <title>Entry Form</title>
  <style>
    #latitude, #longitude, #id {
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
    
    <!-- Hidden Latitude, Longitude, and ID fields -->
    <input type="text" id="id" name="id" readonly><br>
    <input type="text" id="latitude" name="latitude" readonly><br>
    <input type="text" id="longitude" name="longitude" readonly><br><br>
    
    <button type="submit">Submit</button>
  </form>

  <script>
    // Load area options and check reference when the page is loaded
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

        // Auto-generate a unique ID using the current timestamp
        var uniqueId = 'ID-' + new Date().getTime();  // e.g., ID-1683837948123
        document.getElementById('id').value = uniqueId;

      }).getAreas();
    };

    document.getElementById('entryForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('id').value;
      const name = document.getElementById('name').value;
      const address = document.getElementById('address').value;
      const phone = document.getElementById('phone').value;
      const area = document.getElementById('area').value;
      const reference = document.getElementById('reference').value;
      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;
      
      // Check if the reference number matches any value in 'Sheet2'!B2:B
      google.script.run
        .withSuccessHandler(function(isValidReference) {
          if (!isValidReference) {
            alert("Invalid Reference Number.");
            return;
          }
          
          google.script.run
            .withSuccessHandler(function(response) {
              if(response === 'success') {
                alert('Entry successfully added!');
                document.getElementById('entryForm').reset(); // Clear the form fields
              } else {
                alert('Phone number already exists!');
              }
            })
            .withFailureHandler(function(error) {
              alert('Error: ' + error.message);
            })
            .checkPhoneAndSubmit(id, name, address, phone, area, reference, latitude, longitude);
        })
        .checkReferenceNumber(reference);
    });
  </script>
</body>
</html>
