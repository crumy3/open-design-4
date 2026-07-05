# get-vercel-key.ps1 — Retrieve the Vercel API token from Windows Credential Manager
# Usage: $token = .\scripts\get-vercel-key.ps1
# This script never stores the token to disk; it reads from the OS vault only.

$target = "VERCEL_API_TOKEN"

try {
    $cred = cmdkey /list:$target
    if (-not ($cred -match $target)) { throw "Not found" }

    Add-Type -AssemblyName System.Security | Out-Null
    $sig = @"
using System;
using System.Runtime.InteropServices;
public class CredManager {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
    [DllImport("Advapi32.dll", EntryPoint = "CredFree")]
    public static extern void CredFree(IntPtr buffer);
    public struct CREDENTIAL {
        public int Flags; public int Type; public string TargetName; public string Comment;
        public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
        public int Persist; public int AttributeCount; public IntPtr Attributes;
        public string TargetAlias; public string UserName;
    }
}
"@
    Add-Type -TypeDefinition $sig -ErrorAction SilentlyContinue

    $credPtr = [IntPtr]::Zero
    $ok = [CredManager]::CredRead($target, 1, 0, [ref]$credPtr)
    if ($ok) {
        $credStruct = [System.Runtime.InteropServices.Marshal]::PtrToStructure($credPtr, [type][CredManager+CREDENTIAL])
        $bytes = New-Object byte[] $credStruct.CredentialBlobSize
        [System.Runtime.InteropServices.Marshal]::Copy($credStruct.CredentialBlob, $bytes, 0, $credStruct.CredentialBlobSize)
        [CredManager]::CredFree($credPtr) | Out-Null
        return [System.Text.Encoding]::Unicode.GetString($bytes)
    } else {
        throw "CredRead failed"
    }
} catch {
    Write-Host "Could not retrieve $target from Credential Manager: $_" -ForegroundColor Red
}
