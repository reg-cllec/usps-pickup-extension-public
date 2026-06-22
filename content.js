// usps-pickup-auto-filler/content.js
// Runs on https://tools.usps.com/schedule-pickup-steps.htm*

(() => {
  // ------------------------------------------------------------
  // 1️⃣  Your personal data – edit if you ever need to change anything
  // ------------------------------------------------------------
  const data = {
    firstName: "Mike",
    lastName: "Feng",
    street: "80 Tumbleweed Ct",
    city: "San Ramon",
    state: "CA",                 // two‑letter abbreviation
    zip5: "94583",               // first 5 digits
    zip4: "",                    // optional 4‑digit extension (empty)
    phone: "408-780-5205",
    email: "reg.cllec@gmail.com",
    packages: "1",
    weight: "1",                  // pounds
    special: "Pick up from front door; if not find the package please ring door bell"
  };

  // ------------------------------------------------------------
  // 2️⃣  Helper utilities
  // ------------------------------------------------------------
  const waitFor = (selector, timeout = 15000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject(new Error(`Timeout waiting for ${selector}`));
        }
      }, 200);
    });
  };

  const setValue = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) {
      el.focus();
      el.value = value;
      // fire the usual events so the page knows the value changed
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  // ------------------------------------------------------------
  // 3️⃣  Main routine – step‑by‑step filling
  // ------------------------------------------------------------
  // Helper to click a label or button containing specific visible text
  const clickByText = async (text) => {
    // Try button first
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.innerText.trim().toLowerCase() === text.toLowerCase()) {
        b.click();
        return true;
      }
    }
    // Try label associated with radio/checkbox
    const labels = Array.from(document.querySelectorAll('label'));
    for (const lbl of labels) {
      if (lbl.innerText.trim().toLowerCase() === text.toLowerCase()) {
        const forId = lbl.getAttribute('for');
        if (forId) {
          const inp = document.getElementById(forId);
          if (inp) inp.click();
        } else {
          // label wraps the input
          const input = lbl.querySelector('input');
          if (input) input.click();
        }
        return true;
      }
    }
    return false;
  };

  const run = async () => {
    try {
      // ---- STEP 1 – address ------------------------------------------------
      await waitFor('input[id="firstName"], input[name="firstName"]');
      setValue('input[id="firstName"], input[name="firstName"]', data.firstName);
      setValue('input[id="lastName"], input[name="lastName"]', data.lastName);
      setValue('input[id="addressLineOne"], input[name="addressLineOne"], input[id="address1"], input[name="address1"]', data.street);
      setValue('input[id="city"], input[name="city"]', data.city);
      const stateSel = document.querySelector('select[id="state"], select[name="state"]');
      if (stateSel) stateSel.value = data.state;
      setValue('input[id="zipCode"], input[name="zipCode"]', data.zip5);
      setValue('input[id="zip4"], input[name="zip4"]', data.zip4);
      setValue('input[id="phoneNumber"], input[name="phoneNumber"]', data.phone);
      setValue('input[id="emailAddress"], input[name="emailAddress"]', data.email);

      // Scroll to bring the "Check Availability" button into view and click it
      await waitFor('#webToolsAddressCheck', 5000);
      window.scrollTo(0, document.body.scrollHeight);
      document.getElementById('webToolsAddressCheck').click();

      // ---- STEP 2 – address confirmations (dog & location) -----------------
      // Wait for the dog question to appear and answer "No, there isn't a dog at this address."
      await waitFor('label', 10000);
      await clickByText("No, there isn't a dog at this address.");

      // Set package location to Front Door
      const locSel = document.getElementById('packageLocation');
      if (locSel) {
        locSel.value = 'Front_Door';
        locSel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Scroll down so the "Pick up during regular mail delivery" option becomes visible
      window.scrollTo(0, document.body.scrollHeight);
      await waitFor('label', 1000);
      
      // Choose pickup timing "Pick up during regular mail delivery"
      await new Promise(r => setTimeout(r, 2500));
      const pickupLabels = Array.from(document.querySelectorAll('label')).filter(l => l.innerText.includes('Pick up during regular mail delivery'));
      if (pickupLabels.length) {
        pickupLabels[0].click();
        // After selecting timing, click Continue to advance to date selection
        await clickByText('Continue');
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.warn('Pickup timing label not found');
      }

      // Scroll to ensure the date picker is fully visible
      window.scrollTo(0, document.body.scrollHeight);
      
      // Wait for the calendar date links to be present (jQuery UI Datepicker structure)
      await new Promise((resolve, reject) => {
        const deadline = Date.now() + 15000; // 15 s timeout
        const poll = () => {
          const dateLinks = Array.from(document.querySelectorAll('a.ui-state-default'));
          if (dateLinks.length) {
            resolve(dateLinks);
          } else if (Date.now() > deadline) {
            reject(new Error('Timeout waiting for date links'));
          } else {
            setTimeout(poll, 300);
          }
        };
        poll();
      });
      
      // Give the UI a brief fallback safety moment to completely render
      await new Promise(r => setTimeout(r, 500));
      
      // Select the first available/active date link on the calendar
      const dateLinks = Array.from(document.querySelectorAll('a.ui-state-default'));
      if (dateLinks.length) {
        // Clicks the earliest available pickup day in the current view
        dateLinks[0].click();
      } else {
        console.warn('No active date links found on the calendar');
      }

      // Continue to the next screen
      await clickByText("Continue");

     // ---- STEP 4 – package details & submission --------------------------
      // 1. Wait for the packages form container to appear
      await waitFor('#countGroundAdvantage', 10000);
      
      // 2. Set the Ground Advantage package quantity
      setValue('#countGroundAdvantage', data.packages);
      
      // 3. Set the estimated total weight
      setValue('#totalPackageWeight', data.weight);

      // 4. Select "No" to Hazardous Materials by clicking the input ID directly
      // (Bypasses the duplicate 'for="hazmat-no"' label bug in the USPS source HTML)
      const hazmatNoRadio = document.getElementById('hazmat-no');
      if (hazmatNoRadio) {
        hazmatNoRadio.click();
      }

      // 5. Agree to Terms & Conditions using its class name
      const termsCheckbox = document.querySelector('.termsConditions');
      if (termsCheckbox) {
        termsCheckbox.click();
      }

      // Give the UI a brief moment to update totals/weights internally
      await new Promise(r => setTimeout(r, 1000));

      // 6. Click the "Schedule a Pickup" button
      const scheduleBtn = document.getElementById('schedulePickupButton');
      if (scheduleBtn) {
        window.scrollTo(0, document.body.scrollHeight);
        scheduleBtn.click();
      }

    } catch (e) {
      console.error("USPS auto‑filler error:", e);
    }
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    run();
  } else {
    window.addEventListener("DOMContentLoaded", run);
  }
})();
