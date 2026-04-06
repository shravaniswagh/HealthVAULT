$API_KEY = "AIzaSyAlsK2Q87zlp5O4vNdWGFwKT26JzDoI9qg"
$URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY"
$BODY = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Say Hello" }
            )
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri $URL -Method Post -Body $BODY -ContentType "application/json"
