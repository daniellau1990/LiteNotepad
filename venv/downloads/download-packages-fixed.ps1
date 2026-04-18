$packages = @(
    "@codemirror/commands@6.3.3",
    "@codemirror/lang-javascript@6.2.1",
    "@codemirror/lang-json@6.0.1",
    "@codemirror/lang-markdown@6.2.0",
    "@codemirror/state@6.4.0",
    "@codemirror/view@6.26.0",
    "@tauri-apps/api@1.5.3",
    "react@18.2.0",
    "react-dom@18.2.0",
    "@tauri-apps/cli@1.5.6",
    "@testing-library/jest-dom@6.1.5",
    "@testing-library/react@14.1.2",
    "@types/react@18.2.43",
    "@types/react-dom@18.2.17",
    "@types/testing-library__jest-dom@6.0.0",
    "@typescript-eslint/eslint-plugin@6.14.0",
    "@typescript-eslint/parser@6.14.0",
    "@vitejs/plugin-react@4.2.1",
    "@vitest/ui@1.2.0",
    "autoprefixer@10.4.16",
    "eslint@8.55.0",
    "eslint-plugin-react-hooks@4.6.0",
    "eslint-plugin-react-refresh@0.4.5",
    "happy-dom@12.10.3",
    "lodash-es@4.17.21",
    "postcss@8.4.32",
    "tailwindcss@3.3.6",
    "typescript@5.3.3",
    "vite@5.0.8",
    "vitest@1.2.0"
)

foreach ($pkg in $packages) {
    $parts = $pkg.Split('@')
    $name = $parts[0]
    $version = $parts[1]
    if ($name.StartsWith('@')) {
        Write-Host "https://registry.npmmirror.com/$name/-/$name-$version.tgz"
    } else {
        Write-Host "https://registry.npmmirror.com/$name/-/$name-$version.tgz"
    }
}