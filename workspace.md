<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Secure Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    </style>
<script id="tailwind-config">tailwind.config = {darkMode: "class", theme: {extend: {colors: {primary: "#45a204", "background-light": "#f7f8f5", "background-dark": "#17230f", "accent-link": "#007BFF"}, fontFamily: {display: "Manrope"}, borderRadius: {DEFAULT: "0.5rem", lg: "1rem", xl: "1.5rem", full: "9999px"}}}};</script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark">
<div class="relative flex h-auto min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden bg-primary dark:bg-primary" style='font-family: Manrope, "Noto Sans", sans-serif;'>
<!-- Top Section -->
<div class="absolute top-0 left-0 w-full h-[30%] bg-primary dark:bg-primary flex items-center justify-center p-8">
<div class="w-16 h-16 bg-center bg-no-repeat bg-contain" data-alt="Company Logo showing abstract geometric shapes" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAtQsnHv79QMEZQ5UI6qpcomHGRs5b7Tm5092Ltfb3Y0hAyp2msudO9hIpKjvBmA3lrXdeOd7rFUh_h1z4fF4y3c5ZmA0ZTsntuQQ8olIRq15HgZkqdAhV-9DfsutHRZNq5kkfOqpMqJ5FRX3SXmIdJAGvWQWHrkLAV77NuOtKz7NsyBh6o6sjjiuWT9Spoi9l271hiMGvbQnTw2un3D2Hu-dQixuG2cbiFx6Tvn4jNwvgqCzxwtjRVzGMmpOK72GTY14uFjcea0LQ4");'></div>
</div>
<!-- Bottom Card Section -->
<div class="absolute bottom-0 left-0 w-full h-[70%] bg-white dark:bg-background-dark rounded-t-2xl shadow-lg flex flex-col justify-between p-6">
<div class="w-full max-w-md mx-auto">
<h1 class="text-[#111418] dark:text-white tracking-light text-[32px] font-bold leading-tight text-center pb-6">Secure Login</h1>
<div class="flex flex-col gap-4">
<!-- Employee ID Field -->
<div class="flex flex-wrap items-end gap-4">
<label class="flex flex-col w-full flex-1">
<p class="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">Employee ID</p>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#617589] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal" placeholder="Enter your employee ID" value=""/>
</label>
</div>
<!-- Password Field -->
<div class="flex flex-wrap items-end gap-4">
<label class="flex flex-col w-full flex-1">
<p class="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">Password</p>
<div class="flex w-full flex-1 items-stretch rounded-lg">
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#617589] dark:placeholder:text-gray-500 p-[15px] border-r-0 pr-2 text-base font-normal leading-normal" placeholder="Enter your password" type="password" value=""/>
<div class="text-[#617589] dark:text-gray-400 flex border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark items-center justify-center pr-[15px] rounded-r-lg border-l-0 cursor-pointer">
<span class="material-symbols-outlined" data-icon="Eye" data-size="24px" data-weight="regular">visibility</span>
</div>
</div>
</label>
</div>
</div>
<!-- Secure Login Button -->
<div class="flex pt-6">
<button class="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]">
<span class="truncate">Secure Login</span>
</button>
</div>
