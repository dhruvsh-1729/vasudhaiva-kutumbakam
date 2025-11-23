# Email Script Updates - PDF Attachment Added

## Summary
Updated `simple.js` email script to include the painting competition PDF attachment, similar to `lastchance.js`.

## Changes Made

### 1. Added Required Modules
```javascript
const fs = require("fs");
const path = require("path");
```
These modules are needed to read and encode the PDF file.

### 2. PDF Attachment Logic
Added code to read and encode the PDF file at the start of `main()`:
```javascript
const PDF_FILENAME = "painting-competition.pdf";
const pdfPath = path.join(__dirname, PDF_FILENAME);

if (!fs.existsSync(pdfPath)) {
  console.error(`❌ PDF file "${PDF_FILENAME}" not found...`);
  process.exit(1);
}

const pdfBuffer = fs.readFileSync(pdfPath);
const pdfBase64 = pdfBuffer.toString("base64");
const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];
```

### 3. Updated Email Content

#### HTML Content
- Added detailed note about PDF attachment
- Highlighted that painting competition has extended deadline (December 30, 2025)
- Added blue info box with special note about extended timeline
- Explained that painting competition doesn't close tonight

```html
<p style="font-style: italic; margin: 5px 0 0 0; color: #666;">
  📎 <strong>Detailed PDF guide attached!</strong> The painting competition 
  has an extended deadline (December 30, 2025), so you have plenty of time 
  to create your masterpiece! Check the PDF for complete guidelines.
</p>

<div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
  <p style="margin: 0; color: #1976D2; font-weight: bold;">
    🎨 Special Note: Painting Competition Extended Timeline
  </p>
  <p style="margin: 10px 0 0 0; color: #555;">
    Unlike the other competitions closing tonight, the Painting Competition 
    runs until December 30, 2025, giving you more time to work on your 
    artistic creation. Please refer to the attached PDF for detailed 
    submission guidelines, theme requirements, and judging criteria.
  </p>
</div>
```

#### Text Content
Added similar information for plain text version:
```
🎨 SPECIAL NOTE: The Painting Competition has an extended deadline until 
December 30, 2025. Unlike the other competitions closing tonight, you have 
plenty of time to create your masterpiece! Please check the attached PDF 
for detailed guidelines, theme requirements, and judging criteria.
```

### 4. Attached PDF to Email
Updated the `sendSmtpEmail` object to include the attachment:
```javascript
const sendSmtpEmail = {
  sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
  to: [{ email: user.email, name: userName }],
  subject: template.subject,
  htmlContent: template.htmlContent,
  textContent: template.textContent,
  attachment, // ← Added PDF attachment
  headers: { ... },
  tags: [ ... ]
};
```

## File Requirements

**Important:** The PDF file `painting-competition.pdf` must be placed in the same directory as `simple.js`:

```
scripts/emails/
├── simple.js
├── lastchance.js
└── painting-competition.pdf  ← Must exist here
```

## What Users Will See

### In Email Body
1. ✅ Prize amounts for all three competitions
2. ✅ Clear note that PDF is attached
3. ✅ Blue highlighted box explaining painting competition extended deadline
4. ✅ Clarification that painting competition doesn't close tonight
5. ✅ Details about December 30, 2025 deadline for painting

### As Attachment
- 📎 `painting-competition.pdf` file attached to email
- Users can download and read complete painting competition guidelines

## Benefits

1. **Clear Communication** - Users understand painting competition has different timeline
2. **No Confusion** - Explicitly states painting deadline is NOT tonight
3. **Complete Information** - PDF provides all details users need
4. **Consistent with Other Emails** - Matches the approach in `lastchance.js`
5. **Professional** - Proper file attachment with descriptive text

## Testing

Before sending to all users, test with:
```javascript
const users = [{name:"Dhruv Shah", email:"dhruvshdarshansh@gmail.com"}]
```

Verify:
- [ ] Email sends successfully
- [ ] PDF is attached
- [ ] HTML renders correctly with blue info box
- [ ] Text version includes painting competition note
- [ ] Recipients can download and open the PDF

## Error Handling

Script will exit with error message if PDF file is not found:
```
❌ PDF file "painting-competition.pdf" not found in [directory]. 
Place it in the same folder as this script.
```

## Status
✅ **Complete** - simple.js now includes PDF attachment with detailed painting competition information

---

**Updated:** November 20, 2025  
**Files Modified:** `scripts/emails/simple.js`  
**Dependency:** Requires `painting-competition.pdf` in same directory
