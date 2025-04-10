<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Prodigen - Manage Your Freelance Life</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    {{-- Removed large inline style block --}}

</head>

<body class="bg-white dark:bg-gray-900 font-sans antialiased">
    <header class="absolute inset-x-0 top-0 z-50">
        <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div class="flex lg:flex-1">
                <a href="/" class="-m-1.5 p-1.5">
                    <span class="sr-only">Prodigen</span>
                    {{-- Placeholder for Logo --}}
                    <svg class="h-8 w-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                    </svg>
                </a>
            </div>
            <div class="flex lg:hidden">
                {{-- Mobile menu button - Functionality needs Alpine.js or similar --}}
                <button type="button"
                    class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300">
                    <span class="sr-only">Open main menu</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
            <div class="hidden lg:flex lg:gap-x-12">
                {{-- Navigation Links Placeholder --}}
                <a href="#features" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Features</a>
                <a href="#pricing" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Pricing</a>
                <a href="#testimonials"
                    class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Testimonials</a>
            </div>
            <div class="hidden lg:flex lg:flex-1 lg:justify-end">
                @if (Route::has('login'))
                    @auth
                        <a href="{{ url('/dashboard') }}"
                            class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Dashboard <span
                                aria-hidden="true">&rarr;</span></a>
                    @else
                        <a href="{{ route('login') }}"
                            class="text-sm font-semibold leading-6 text-gray-900 dark:text-white mr-4">Log in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}"
                                class="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Register</a>
                        @endif
                    @endauth
                @endif
            </div>
        </nav>
        {{-- Mobile menu, show/hide based on menu state. Needs Alpine.js or similar --}}
        <div class="lg:hidden hidden" role="dialog" aria-modal="true">
            {{-- Background backdrop, show/hide based on slide-over state. --}}
            <div class="fixed inset-0 z-50"></div>
            <div
                class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div class="flex items-center justify-between">
                    <a href="/" class="-m-1.5 p-1.5">
                        <span class="sr-only">Prodigen</span>
                        {{-- Placeholder Logo --}}
                        <svg class="h-8 w-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                        </svg>
                    </a>
                    <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300">
                        <span class="sr-only">Close menu</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                            aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mt-6 flow-root">
                    <div class="-my-6 divide-y divide-gray-500/10">
                        <div class="space-y-2 py-6">
                            <a href="#features"
                                class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Features</a>
                            <a href="#pricing"
                                class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Pricing</a>
                            <a href="#testimonials"
                                class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Testimonials</a>
                        </div>
                        <div class="py-6">
                            @if (Route::has('login'))
                                @auth
                                    <a href="{{ url('/dashboard') }}"
                                        class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Dashboard</a>
                                @else
                                    <a href="{{ route('login') }}"
                                        class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Log
                                        in</a>
                                    @if (Route::has('register'))
                                        <a href="{{ route('register') }}"
                                            class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Register</a>
                                    @endif
                                @endauth
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="isolate">
        {{-- Hero Section --}}
        <div class="relative pt-14 bg-gray-200 dark:bg-yellow-900/20">
            {{-- Background Shapes/Gradient - Placeholder --}}
            <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                aria-hidden="true">
                <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)">
                </div>
            </div>
            <div class="py-24 sm:py-32">
                <div class="mx-auto max-w-7xl px-6 lg:px-8">
                    <div class="mx-auto max-w-2xl text-center">
                        <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Manage
                            Your Freelance Business with Ease</h1>
                        <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">Track finances, manage tasks,
                            monitor your time, and prioritize your well-being. All in one place.</p>
                        <div class="mt-10 flex items-center justify-center gap-x-6">
                            <a href="{{ route('register') }}"
                                class="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Get
                                Started Today</a>
                            <a href="#features"
                                class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Learn more <span
                                    aria-hidden="true">→</span></a>
                        </div>
                    </div>
                    <div class="mt-16 flow-root sm:mt-24">
                        {{-- Placeholder for Hero Image/Illustration --}}
                        <div
                            class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                            <img src="{{ Vite::asset('resources/images/app.png') }}" alt="App screenshot"
                                width="2432" height="1442" class="rounded-md shadow-2xl ring-1 ring-gray-900/10">
                        </div>
                    </div>
                </div>
            </div>
            {{-- Background Shapes/Gradient - Placeholder --}}
            <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                aria-hidden="true">
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)">
                </div>
            </div>
        </div>

        {{-- Logo Cloud --}}
        <div class="bg-white dark:bg-gray-900 py-24 sm:py-32">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 class="text-center text-lg font-semibold leading-8 text-gray-900 dark:text-white">Trusted by
                    freelancers worldwide</h2>
                <div
                    class="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                    {{-- Placeholder Logos --}}
                    <img class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                        src="https://tailwindui.com/img/logos/158x48/transistor-logo-gray-900.svg" alt="Transistor"
                        width="158" height="48">
                    <img class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                        src="https://tailwindui.com/img/logos/158x48/reform-logo-gray-900.svg" alt="Reform"
                        width="158" height="48">
                    <img class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                        src="https://tailwindui.com/img/logos/158x48/tuple-logo-gray-900.svg" alt="Tuple"
                        width="158" height="48">
                    <img class="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                        src="https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-900.svg" alt="SavvyCal"
                        width="158" height="48">
                    <img class="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
                        src="https://tailwindui.com/img/logos/158x48/statamic-logo-gray-900.svg" alt="Statamic"
                        width="158" height="48">
                </div>
            </div>
        </div>

        {{-- Stats Section --}}
        <div class="bg-gray-100 dark:bg-gray-800 py-24 sm:py-32">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl lg:max-w-none">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Boost
                            Your Freelance Productivity</h2>
                        <p class="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">See the impact Prodigen can
                            have on your workflow and bottom line.</p>
                    </div>
                    <dl
                        class="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                        {{-- Placeholder Stats --}}
                        <div class="flex flex-col bg-yellow-300/80 dark:bg-yellow-700/50 p-8">
                            <dt class="text-sm font-semibold leading-6 text-gray-700 dark:text-yellow-200">Hours Saved
                                Weekly</dt>
                            <dd
                                class="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                5+</dd>
                        </div>
                        <div class="flex flex-col bg-orange-300/80 dark:bg-orange-700/50 p-8">
                            <dt class="text-sm font-semibold leading-6 text-gray-700 dark:text-orange-200">Income
                                Visibility</dt>
                            <dd
                                class="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                83%</dd>
                        </div>
                        <div class="flex flex-col bg-blue-300/80 dark:bg-blue-700/50 p-8">
                            <dt class="text-sm font-semibold leading-6 text-gray-700 dark:text-blue-200">Task
                                Completion Rate</dt>
                            <dd
                                class="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                92%</dd>
                        </div>
                        <div class="flex flex-col bg-red-300/80 dark:bg-red-700/50 p-8">
                            <dt class="text-sm font-semibold leading-6 text-gray-700 dark:text-red-200">Wellness Goals
                                Met</dt>
                            <dd
                                class="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                75%+</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>

        {{-- Feature Section 1 (Example) --}}
        <div id="features" class="overflow-hidden bg-white dark:bg-gray-900 py-24 sm:py-32">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div class="lg:pr-8 lg:pt-4">
                        <div class="lg:max-w-lg">
                            <h2 class="text-base font-semibold leading-7 text-gray-600 dark:text-gray-400">
                                Effortless Management</h2>
                            <p
                                class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Your Freelance Command Center</p>
                            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">Stop juggling
                                spreadsheets and apps. Prodigen brings your finances, tasks, time tracking, and wellness
                                goals into one intuitive dashboard.</p>
                            <dl
                                class="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 dark:text-gray-300 lg:max-w-none">
                                <div class="relative pl-9">
                                    <dt class="inline font-semibold text-gray-900 dark:text-white">
                                        {{-- Placeholder Icon --}}
                                        <svg class="absolute left-1 top-1 h-5 w-5 text-gray-600 dark:text-gray-400"
                                            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fill-rule="evenodd"
                                                d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Finance Tracking.
                                    </dt>
                                    <dd class="inline">Log income and expenses easily. See your net profit at a glance.
                                    </dd>
                                </div>
                                <div class="relative pl-9">
                                    <dt class="inline font-semibold text-gray-900 dark:text-white">
                                        {{-- Placeholder Icon --}}
                                        <svg class="absolute left-1 top-1 h-5 w-5 text-gray-600 dark:text-gray-400"
                                            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fill-rule="evenodd"
                                                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Task & Time Management.
                                    </dt>
                                    <dd class="inline">Organize work by client and project. Track time accurately to
                                        bill smarter.</dd>
                                </div>
                                <div class="relative pl-9">
                                    <dt class="inline font-semibold text-gray-900 dark:text-white">
                                        {{-- Placeholder Icon --}}
                                        <svg class="absolute left-1 top-1 h-5 w-5 text-gray-600 dark:text-gray-400"
                                            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path
                                                d="M4.632 3.533A2 2 0 016.577 2.646l10.92.44A2 2 0 0119 4.988v10.024a2 2 0 01-1.503 1.916l-10.92.44A2 2 0 014.08 15.47l-.926-2.472a.5.5 0 01.13-.524l3.498-4.197a.5.5 0 01.788.021l1.65 2.53a.5.5 0 01.03.52l-1.19 1.94a.5.5 0 00.77.61L11 13.49l1.53-1.846a.5.5 0 01.786-.01l1.75 2.1a.5.5 0 00.788-.09l.9-1.6a.5.5 0 00-.08-.58l-3.49-4.188a.5.5 0 00-.787-.021l-1.65 2.53a.5.5 0 00.03.52l1.19 1.94a.5.5 0 01-.77.61L9 10.51l-1.53 1.846a.5.5 0 00-.786.01l-1.75 2.1a.5.5 0 01-.788.09l-.9-1.6a.5.5 0 01.08-.58l3.49-4.188A2 2 0 015.34 5.053l-.708-.284z" />
                                        </svg>
                                        Wellness Tracking.
                                    </dt>
                                    <dd class="inline">Prioritize self-care. Track habits that support your well-being
                                        alongside your work.</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                    {{-- Placeholder for Feature Image --}}
                    <img src="{{ Vite::asset('resources/images/app.png') }}" alt="Product screenshot"
                        class="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                        width="2432" height="1442">
                </div>
            </div>
        </div>

        {{-- Pricing Section (Placeholder) --}}
        <div id="pricing" class="bg-white dark:bg-gray-900 py-24 sm:py-32">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl sm:text-center">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Simple
                        Pricing for Freelancers</h2>
                    <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">Choose the plan that fits your
                        freelance journey. Start free, upgrade anytime.</p>
                </div>
                {{-- Pricing details placeholder --}}
                <div
                    class="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 dark:ring-gray-700 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                    <div class="p-8 sm:p-10 lg:flex-auto">
                        <h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Free Plan</h3>
                        <p class="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">Get started with essential
                            tools for your freelance business. Supported by ads.</p>
                        <div class="mt-10 flex items-center gap-x-4">
                            <h4 class="flex-none text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                                What's included</h4>
                            <div class="h-px flex-auto bg-gray-100 dark:bg-gray-700"></div>
                        </div>
                        <ul role="list"
                            class="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:grid-cols-2 sm:gap-6">
                            {{-- Feature list placeholder --}}
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Basic Project Management</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Standard Reporting</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Basic Wellness Tracking</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Ad-Supported Experience</li>
                        </ul>
                    </div>
                    <div class="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                        <div
                            class="rounded-2xl bg-gray-50 dark:bg-gray-800/80 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                            <div class="mx-auto max-w-xs px-8">
                                <p class="text-base font-semibold text-gray-600 dark:text-gray-300">Free to get started
                                </p>
                                <p class="mt-6 flex items-baseline justify-center gap-x-2">
                                    <span
                                        class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">$0</span>
                                    <span
                                        class="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">/month</span>
                                </p>
                                <a href="{{ route('register') }}"
                                    class="mt-10 block w-full rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Get
                                    started</a>
                                <p class="mt-6 text-xs leading-5 text-gray-600 dark:text-gray-300">Upgrade at any time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 dark:ring-gray-700 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                    <div class="p-8 sm:p-10 lg:flex-auto">
                        <h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pro Plan</h3>
                        <p class="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">Unlock advanced features
                            to supercharge your freelance business.</p>
                        <div class="mt-10 flex items-center gap-x-4">
                            <h4 class="flex-none text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                                What's included</h4>
                            <div class="h-px flex-auto bg-gray-100 dark:bg-gray-700"></div>
                        </div>
                        <ul role="list"
                            class="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:grid-cols-2 sm:gap-6">
                            {{-- Feature list placeholder --}}
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Unlimited Projects</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Advanced Reporting</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Custom Wellness Goals</li>
                            <li class="flex gap-x-3"><svg class="h-6 w-5 flex-none text-gray-600 dark:text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd" />
                                </svg>Priority Support</li>
                        </ul>
                    </div>
                    <div class="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                        <div
                            class="rounded-2xl bg-gray-50 dark:bg-gray-800/80 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                            <div class="mx-auto max-w-xs px-8">
                                <p class="text-base font-semibold text-gray-600 dark:text-gray-300">Pay once, own it
                                    forever</p>
                                <p class="mt-6 flex items-baseline justify-center gap-x-2">
                                    <span
                                        class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">$15</span>
                                    <span
                                        class="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">/month</span>
                                </p>
                                <a href="{{ route('register') }}"
                                    class="mt-10 block w-full rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Get
                                    access</a>
                                <p class="mt-6 text-xs leading-5 text-gray-600 dark:text-gray-300">Invoices and
                                    receipts available for easy company reimbursement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- CTA Section --}}
        <div class="bg-gray-100 dark:bg-gray-800">
            <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Ready to
                    streamline your freelance life?<br>Start using Prodigen today.</h2>
                <div class="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
                    <a href="{{ route('register') }}"
                        class="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Get
                        started</a>
                    <a href="#" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Learn more
                        <span aria-hidden="true">→</span></a>
                </div>
            </div>
        </div>

    </main>

    {{-- Footer --}}
    <footer class="bg-gray-900" aria-labelledby="footer-heading">
        <h2 id="footer-heading" class="sr-only">Footer</h2>
        <div class="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
            {{-- Footer Links Placeholder --}}
            <div class="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                <p class="text-xs leading-5 text-gray-400">&copy; {{ date('Y') }} Prodigen. All rights reserved.
                </p>
            </div>
        </div>
    </footer>

</body>

</html>
