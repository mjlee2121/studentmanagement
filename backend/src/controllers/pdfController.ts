import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';

// Helper function to extract text patterns from PDF text
function extractField(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

// Helper function to extract arrays (universities, etc.)
function extractArray(text: string, pattern: RegExp): string[] {
  const matches = text.match(pattern);
  if (matches && matches[1]) {
    return matches[1]
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

// Helper function to extract date from text
function extractDate(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to parse and format the date
      try {
        const dateStr = match[1].trim();
        // If it's already in ISO format, return as is
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr;
        }
        // Try to parse common date formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  return undefined;
}

export const parseApplicationForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file was uploaded. Please select a PDF file to upload.' });
      return;
    }

    // Parse PDF
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    // Extract student information using pattern matching
    const extractedData: any = {};

    // First Name
    extractedData.firstName = extractField(text, [
      /first\s*name[:\s]+([A-Za-z]+)/i,
      /first[:\s]+([A-Za-z]+)/i,
      /name[:\s]+([A-Za-z]+)/i,
    ]);

    // Last Name
    extractedData.lastName = extractField(text, [
      /last\s*name[:\s]+([A-Za-z]+)/i,
      /surname[:\s]+([A-Za-z]+)/i,
      /family\s*name[:\s]+([A-Za-z]+)/i,
    ]);

    // Email
    extractedData.email = extractField(text, [
      /email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /e-mail[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    ]);

    // Phone
    extractedData.phone = extractField(text, [
      /phone[:\s]+([\d\s\-\(\)\+]+)/i,
      /telephone[:\s]+([\d\s\-\(\)\+]+)/i,
      /mobile[:\s]+([\d\s\-\(\)\+]+)/i,
      /contact[:\s]+([\d\s\-\(\)\+]+)/i,
    ]);

    // Date of Birth
    extractedData.dateOfBirth = extractDate(text, [
      /date\s*of\s*birth[:\s]+([\d\/\-\.]+)/i,
      /dob[:\s]+([\d\/\-\.]+)/i,
      /birth\s*date[:\s]+([\d\/\-\.]+)/i,
    ]);

    // Major
    extractedData.major = extractField(text, [
      /major[:\s]+([A-Za-z\s]+)/i,
      /field\s*of\s*study[:\s]+([A-Za-z\s]+)/i,
      /program[:\s]+([A-Za-z\s]+)/i,
    ]);

    // Desired Admission Term
    extractedData.desiredAdmissionTerm = extractField(text, [
      /admission\s*term[:\s]+([A-Za-z\s\d]+)/i,
      /term[:\s]+([A-Za-z\s\d]+)/i,
      /semester[:\s]+([A-Za-z\s\d]+)/i,
    ]);

    // Desired Universities
    const universityPatterns = [
      /universit(y|ies)[:\s]+([A-Za-z\s,]+)/i,
      /school(s)?[:\s]+([A-Za-z\s,]+)/i,
      /institution(s)?[:\s]+([A-Za-z\s,]+)/i,
    ];
    
    let universities: string[] = [];
    for (const pattern of universityPatterns) {
      const matches = text.match(pattern);
      if (matches && matches[2]) {
        universities = matches[2]
          .split(/[,;]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0 && item.length < 100);
        if (universities.length > 0) break;
      }
    }
    extractedData.desiredUniversities = universities;

    // Check for Shorelight application keywords
    const shorelightKeywords = [
      /shorelight/i,
      /stony\s*brook/i,
      /umass\s*boston/i,
      /university\s*of\s*illinois\s*chicago/i,
    ];
    
    extractedData.shorelightApplication = shorelightKeywords.some((pattern) =>
      pattern.test(text)
    );

    // Extract Shorelight universities if mentioned
    const shorelightUnis: string[] = [];
    if (text.match(/stony\s*brook/i)) shorelightUnis.push('Stony Brook');
    if (text.match(/umass\s*boston/i)) shorelightUnis.push('UMASS Boston');
    if (text.match(/university\s*of\s*illinois\s*chicago/i))
      shorelightUnis.push('University of Illinois Chicago');
    extractedData.shorelightUniversities = shorelightUnis;

    // Homestay Address
    extractedData.homestayAddress = extractField(text, [
      /homestay[:\s]+([A-Za-z0-9\s,\.\-]+)/i,
      /address[:\s]+([A-Za-z0-9\s,\.\-]+)/i,
    ]);

    // Boston Arrival Date
    extractedData.bostonArrivalDate = extractDate(text, [
      /boston\s*arrival[:\s]+([\d\/\-\.]+)/i,
      /arrival\s*date[:\s]+([\d\/\-\.]+)/i,
    ]);

    // Expected Graduation Date
    extractedData.expectedGraduationDate = extractDate(text, [
      /expected\s*graduation[:\s]+([\d\/\-\.]+)/i,
      /graduation\s*date[:\s]+([\d\/\-\.]+)/i,
    ]);

    // Check for document collection indicators
    extractedData.passportCollected = /passport/i.test(text);
    extractedData.applicationFormCollected = true; // If we're parsing it, it's collected
    extractedData.highschoolTranscriptCollected = /high\s*school\s*transcript/i.test(text);
    extractedData.collegeTranscriptCollected = /college\s*transcript/i.test(text);
    extractedData.stage2Services = /stage\s*2/i.test(text);

    // Remove undefined values
    Object.keys(extractedData).forEach((key) => {
      if (extractedData[key] === undefined || extractedData[key] === '') {
        delete extractedData[key];
      }
    });

    res.json(extractedData);
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ 
      error: 'Unable to parse the PDF file. Please ensure the file is a valid PDF and contains readable text. You can manually fill out the form instead.' 
    });
  }
};

