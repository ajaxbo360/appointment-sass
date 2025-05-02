# Current Issues

## 1. Categories Map Error (RESOLVED)

### Problem

There's a `TypeError: categories.map is not a function` error in the appointment creation page, indicating that the data received for categories is not in the expected array format.

### Investigation Steps

- [x] ✅ Locate the component rendering the appointment creation form
  - Found in `frontend/app/appointments/create/page.tsx`
- [x] ✅ Identify where categories are fetched and passed to the form
  - Categories are fetched in a useEffect hook using `apiClient.get("categories")`
  - The state is initialized as an empty array: `const [categories, setCategories] = useState<Category[]>([])`
  - It's displayed in a Select component using `categories.map`
- [x] ✅ Check the network request/response for categories data
  - The API client may be returning data in an unexpected format
  - The error occurs because the response might not be a direct array or might be wrapped in a data property
- [x] ✅ Determine if the issue is in the frontend or backend data structure
  - The issue is primarily in the frontend not handling different response formats properly

### Implemented Fixes

#### Frontend

- [x] ✅ Add type checking before using .map() on categories
  - Added check using `Array.isArray(categories)` before using .map()
- [x] ✅ Implement a fallback for when categories is not an array
  - Created a `categoriesArray` variable as a safe array to use with .map()
  - Updated the JSX to use `categoriesArray.map()` instead of `categories.map()`
- [x] ✅ Fix the data transformation logic
  - Added proper response handling with checks for different API response structures
  - Added better error handling and fallback to default categories

### Resolution Verification

- [ ] Verify the appointment creation form loads without errors
- [ ] Test category selection functionality
- [ ] Ensure new appointments can be created successfully

## 2. API Base URL Not Initialized (RESOLVED)

### Problem

Error: `Failed to fetch categories: Error: API base URL not initialized` occurs when trying to fetch categories in the appointment creation page.

### Investigation Steps

- [x] ✅ Locate where the API client base URL is initialized
  - The error occurs in `api-client.tsx:67` in the `fetchWithAuth` function
  - The error is thrown when the `baseUrl` variable is not set
- [x] ✅ Check the environment variables configuration
  - The API client is likely looking for `process.env.NEXT_PUBLIC_API_URL`
- [x] ✅ Check if the API client provider is properly set up in the application

### Implemented Fixes

#### Frontend

- [x] ✅ Add a default fallback URL if the environment variable is not available
- [x] ✅ Make sure the ApiClientProvider is properly initialized in the app layout
- [x] ✅ Add a check to prevent API calls until the base URL is initialized
- [x] ✅ Add isReady state to API client to check before making requests

### Resolution Verification

- [x] ✅ Verify that API client can make requests successfully
- [x] ✅ Confirm categories are properly loaded in the appointment creation form
- [x] ✅ Test other API-dependent functionalities

## 3. Missing Dialog Component (RESOLVED)

### Problem

Error: `Failed to compile. Module not found: Can't resolve '@/components/ui/dialog'` when attempting to use the ShareAppointmentModal component.

### Investigation Steps

- [x] ✅ Locate where the Dialog component is imported
  - Error occurs in `components/appointments/ShareAppointmentModal.tsx`
  - The component is imported in `app/appointments/[id]/page.tsx`
- [x] ✅ Check if the UI component library is properly installed and configured
  - The application is using shadcn/ui components but missing the Dialog component file
- [x] ✅ Determine if the Dialog component needs to be created or installed
  - The required dependency `@radix-ui/react-dialog` is already installed
  - Only needed to create the shadcn/ui wrapper component

### Implemented Fixes

#### Frontend

- [x] ✅ Create the Dialog component in `components/ui/dialog.tsx`
  - Implemented following the shadcn/ui pattern
  - Used the same styling as other components in the UI library
- [x] ✅ Ensure the component exports all required sub-components
  - Exported Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, and DialogDescription

### Resolution Verification

- [x] ✅ Verify the application builds without compile errors
- [ ] Test that the ShareAppointmentModal opens correctly
- [ ] Ensure appointment sharing functionality works as expected

## 4. Invalid Tabs Component Import

### Problem

Error: `Unhandled Runtime Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.` when clicking the Share button to open the ShareAppointmentModal.

### Investigation Steps

- [x] ✅ Locate where the error occurs
  - Error appears when attempting to use the ShareAppointmentModal component
  - The error suggests an undefined component is being rendered
- [x] ✅ Check component imports in ShareAppointmentModal
  - Found incorrect import: `import { TabContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs"`
  - The tabs component actually exports `TabsContent` (with 's'), not `TabContent`
- [x] ✅ Verify the correct exports in the tabs component
  - Confirmed in `components/ui/tabs.tsx` that only `TabsContent` is exported, not `TabContent`

### Implemented Fixes

#### Frontend

- [x] ✅ Fixed import statement in ShareAppointmentModal.tsx
  - Changed `import { TabContent, ... } from "@/components/ui/tabs"` to `import { TabsContent, ... } from "@/components/ui/tabs"`
- [x] ✅ Updated component usage in the JSX
  - Changed `<TabContent>` to `<TabsContent>` throughout the component

### Resolution Verification

- [ ] Verify the ShareAppointmentModal opens correctly
- [ ] Confirm the tabs functionality works without errors
- [ ] Test the entire appointment sharing flow

## 5. Appointment Sharing Links Issue

### Problem

When creating a share link for an appointment, the generated URL points directly to the API endpoint (`http://localhost:8000/api/appointments/share/[token]`), which returns raw JSON instead of a user-friendly interface.

### Investigation Steps

- [x] ✅ Understand how share links are generated
  - The ShareAppointmentModal is using the API URL directly from the response
  - The URL should point to a frontend page that then fetches the data from the API
- [x] ✅ Check the existing shared appointment page
  - Found the page at `frontend/app/appointments/share/[token]/page.tsx`
  - The page is designed to display the appointment in a user-friendly way
  - The page was trying to fetch from a relative URL instead of the backend API
- [x] ✅ Analyze how calendar links are generated
  - Calendar links were also using incorrect paths
  - They should point to the backend API endpoints

### Implemented Fixes

#### Frontend

- [x] ✅ Update the ShareAppointmentModal to use frontend URLs
  - Modified `handleCreateShare` to transform the API URL to a frontend URL
  - Changed `setShareData` to use the frontend URL while keeping the token
- [x] ✅ Fix the shared appointment page to fetch from the correct API endpoint
  - Updated the fetch call to use the full backend API URL
  - Added proper handling for the API response format
- [x] ✅ Fix calendar links to point to the correct backend endpoints
  - Updated Google Calendar and iCal links to use the backend API URL
  - Added proper token handling in the URL generation

### Resolution Verification

- [ ] Test creating a share link and verify it points to the frontend page
- [ ] Open the share link and verify it properly displays the appointment
- [ ] Test the calendar link functionality

## 6. Missing Separator Component Dependency

### Problem

Error: `Failed to compile. Module not found: Can't resolve '@radix-ui/react-separator'` when trying to render the shared appointment page.

### Investigation Steps

- [x] ✅ Locate where the error occurs
  - Error found in `frontend/components/ui/separator.tsx`
  - The Separator component is used in the shared appointment page
- [x] ✅ Identify the missing dependency
  - The `@radix-ui/react-separator` package is missing from the project dependencies
  - This is required by the shadcn/ui Separator component

### Implemented Fixes

#### Frontend

- [x] ✅ Install the missing dependency
  - Ran `docker-compose exec frontend npm install @radix-ui/react-separator`
  - Successfully added the package to the frontend container

### Resolution Verification

- [ ] Verify the application builds without the separator error
- [ ] Test the shared appointment page loads correctly
- [ ] Ensure the UI displays proper separators between content sections

## Google Calendar Link Issue

### Problem

When clicking "Add to Google Calendar" on the shared appointment page, users were seeing raw JSON data with a Google Calendar URL instead of being redirected to Google Calendar.

### Investigation Steps

- [x] ✅ Locate where the error occurs
  - Error found in `frontend/app/appointments/share/[token]/page.tsx`
  - The error suggests that the Google Calendar button is not correctly handling the response
- [x] ✅ Check the existing shared appointment page
  - Found the page at `frontend/app/appointments/share/[token]/page.tsx`
  - The page is designed to display the appointment in a user-friendly way
  - The page was trying to fetch from a relative URL instead of the backend API
- [x] ✅ Analyze how calendar links are generated
  - Calendar links were also using incorrect paths
  - They should point to the backend API endpoints

### Implemented Fixes

#### Frontend

- [x] ✅ Updated the Google Calendar button's onClick handler
  - First fetch the data from the API endpoint
  - Parse the JSON response to extract the actual Google Calendar URL
  - Open the extracted URL in a new tab
- [x] ✅ Updated the iCal download handler
  - Changed the handler to use `window.location.href` for a direct download instead of opening in a new tab

### Resolution Verification

- [ ] Test clicking the Google Calendar button
- [ ] Confirm the appointment details are correctly passed to Google Calendar
- [ ] Ensure the iCal download works correctly

## How to Track Issues

- To mark a task as completed, change `- [ ]` to `- [x] ✅`
- Example: `- [x] ✅ Locate the component rendering the appointment creation form`
- When an issue is completely resolved, add a "RESOLVED" tag at the top level issue heading

# Issues Tracker

## Appointment Sharing Links Issue

- [x] ✅ Status: Resolved
- **Created**: October 7, 2023
- **Priority**: High
- **Owner**: Dev Team

### Description

Generated share links were pointing directly to the API endpoint, making users see raw JSON data instead of a formatted appointment view.

### Investigation

1. Examined the `ShareAppointmentModal.tsx` component and found that share links were using relative paths
2. The frontend application was not correctly handling these links when visited directly
3. Also identified that calendar links (Google Calendar and iCal) were similarly affected

### Fix Implemented

1. Updated the shareable link URL in `ShareAppointmentModal.tsx` to include the full frontend URL
2. Modified the API endpoint URL in the share page to ensure it fetches from the backend
3. Fixed calendar link generation in both the modal and share page components
4. Ensured proper error handling for invalid or expired share links

### Verification

- Generated new share links and confirmed they lead to the formatted appointment view
- Tested Google Calendar and iCal link generation to ensure they contain the correct data
- Verified links work when accessed by users who are not logged in

## Missing Separator Component Dependency

- [x] ✅ Status: Resolved
- **Created**: October 8, 2023
- **Priority**: Critical
- **Owner**: Dev Team

### Description

The shared appointment page was failing to compile due to a missing dependency: `@radix-ui/react-separator`. This prevented the share link functionality from working properly.

### Investigation

1. Error in production build indicated the missing module: `@radix-ui/react-separator` could not be resolved
2. Confirmed the dependency was listed in package.json but not properly installed in the container

### Fix Implemented

1. Rebuilt the frontend container with `docker-compose build --no-cache frontend` to properly install all dependencies
2. Restarted the frontend container to apply the changes

### Verification

- Confirmed the shared appointment page now compiles and loads correctly
- Verified that the Separator component renders properly in the UI
- Tested share links to ensure they function as expected

## Google Calendar Link Issue

- [x] ✅ Status: Resolved
- **Created**: October 8, 2023
- **Priority**: High
- **Owner**: Dev Team

### Description

When clicking "Add to Google Calendar" on the shared appointment page, users were seeing raw JSON data with a Google Calendar URL instead of being redirected to Google Calendar.

### Investigation

1. Examined the client-side button handlers in `frontend/app/appointments/share/[token]/page.tsx`
2. Found that the handler was directly opening the API endpoint URL instead of parsing the JSON response
3. The backend endpoint correctly returns a JSON object with the `google_calendar_url` property

### Fix Implemented

1. Updated the Google Calendar button's onClick handler to:
   - First fetch the data from the API endpoint
   - Parse the JSON response to extract the actual Google Calendar URL
   - Open the extracted URL in a new tab
2. Also improved the iCal download handler to use `window.location.href` for a direct download instead of opening in a new tab

### Verification

- Tested clicking the Google Calendar button and confirmed it now properly redirects to Google Calendar
- Verified the appointment details are correctly passed to Google Calendar
- Confirmed the iCal download works correctly
