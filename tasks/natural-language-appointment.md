# Natural Language Appointment Creation

## Feature Overview

Add an AI-powered natural language input that allows users to create appointments by writing conversational text like "Meeting with John tomorrow at 2pm for project review". The system will parse this text and automatically fill in the appointment form fields.

## Technical Requirements

- Frontend component for natural language input
- Backend API endpoint to process natural language input
- Integration with an LLM API (OpenAI, Google Gemini, etc.)
- Proper error handling and feedback
- Accessibility considerations

## Implementation Steps

### Backend Implementation

1. **Create API Endpoint**

   - [ ] Create a new controller `NaturalLanguageController`
   - [ ] Implement a `parseAppointment` method to handle POST requests
   - [ ] Set up validation for the input text
   - [ ] Set up an OpenAI or similar AI service integration

2. **LLM Integration**

   - [ ] Set up OpenAI API credentials in the environment variables
   - [ ] Create a service to handle communication with the LLM API
   - [ ] Design a prompt template that extracts structured information from natural language
   - [ ] Handle rate limiting and error responses from the LLM API

3. **Response Processing**
   - [ ] Parse the LLM response into a structured format
   - [ ] Validate that required fields are present (title, date, time)
   - [ ] Format dates and times to match the application's expected format
   - [ ] Add handling for category matching based on description

### Frontend Implementation

1. **Create UI Component**

   - [ ] Create a `NaturalLanguageInput` component
   - [ ] Design a user-friendly input field with an "AI Parse" button
   - [ ] Add loading state for when the request is processing
   - [ ] Add clear and informative placeholder text

2. **Integrate with Appointment Form**

   - [ ] Add the natural language component to the top of the appointment creation form
   - [ ] Implement handlers to populate the form fields with parsed data
   - [ ] Add visual feedback when fields are auto-populated
   - [ ] Ensure users can still edit the fields after auto-population

3. **Error Handling**
   - [ ] Add user-friendly error messages for parsing failures
   - [ ] Handle cases where the AI couldn't extract all required information
   - [ ] Implement suggestions for improving the input text clarity
   - [ ] Provide fallback functionality if the AI service is unavailable

## Testing Criteria

1. **Functionality Testing**

   - [ ] Test with various types of natural language inputs
   - [ ] Verify correct parsing of dates in multiple formats (today, tomorrow, next week, May 15th)
   - [ ] Verify correct parsing of times (2pm, 14:00, morning, afternoon)
   - [ ] Verify correct extraction of meeting duration
   - [ ] Verify correct extraction of participants and location information

2. **Integration Testing**

   - [ ] Test the full flow from natural language input to appointment creation
   - [ ] Verify form fields are correctly populated
   - [ ] Verify validation still works correctly on auto-populated fields
   - [ ] Test with the AI service offline/returning errors

3. **User Experience Testing**
   - [ ] Verify the feature works intuitively without instructions
   - [ ] Ensure error messages are helpful for improving input
   - [ ] Verify the UI remains responsive during processing
   - [ ] Ensure accessibility for screen readers and keyboard navigation

## Example Inputs to Support

- "Meeting with John tomorrow at 2pm"
- "Doctor's appointment next Tuesday at 10am for 1 hour"
- "Weekly team standup every Monday at 9:30am"
- "Client call with ABC Corp on May 15th from 3-4pm about new project proposal"
- "Lunch with marketing team this Friday at noon"

## AI Service Considerations

- OpenAI GPT-3.5 Turbo or GPT-4 (costs per request)
- Google Gemini API (potentially lower cost)
- Self-hosted language model options for privacy and cost control
- Consider rate limiting to manage costs
- Cache similar requests to reduce API calls
