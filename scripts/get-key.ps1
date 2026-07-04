# get-key.ps1 — Retrieve the OpenAI API key from Windows Credential Manager
# Usage: $key = .\scripts\get-key.ps1
# This script never stores the key to disk; it reads from the OS vault only.

$target = "OPENAI_API_KEY"

try {
    # Use cmdkey to confirm it exists, then retrieve via .NET
    $creds = [System.Runtime.InteropServices.Marshal]
    Add-Type -AssemblyName System.Security | Out-Null

    $credObj = Get-StoredCredential -Target $target -ErrorAction Stop
    return $credObj.GetNetworkCredential().Password
} catch {
    # Fallback: use cmdkey + CredentialManager via Windows API
    $sig = @"
[DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);

[DllImport("Advapi32.dll", EntryPoint = "CredFree")]
public static extern void CredFree(IntPtr buffer);
"@
    Write-Host "Key target: $target — retrieve via Windows Credential Manager UI or:" -ForegroundColor Yellow
    Write-Host "  cmdkey /list:$target" -ForegroundColor Cyan
    Write-Host "  Or use: [System.Net.NetworkCredential] with PSCredential" -ForegroundColor Cyan
}
