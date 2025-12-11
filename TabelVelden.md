# KioskLijst - Required Columns

This document tracks the required columns for the 'KioskLijst' SharePoint list located at `https://som.org.om.local/sites/muldert/onderdelen/beoordelen/verkeersborden/`.

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Title      | Text      | Yes      | Title of the article/page |
| PageUrl    | URL       | Yes      | Link to the original SitePage |
| Status     | Choice    | Yes      | Status of the item ('Actief', 'Niet actief') |
| OriginalId | Number    | Yes      | ID of the original SitePage item for tracking |
| DateAdded  | DateTime  | No       | Date when the item was added to the Kiosk list |
| Resultaat  | Note      | No       | Result/Reason when deactivating an item |
