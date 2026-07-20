import { redirect } from "next/navigation";

import { signIn } from "@/auth/actions";
import { getIsAdmin } from "@/auth/session";

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	const isAdmin = await getIsAdmin();

	if (isAdmin) {
		redirect("/admin");
	}

	return (
		<main className="min-h-screen bg-[#e8e4de] px-4 py-8 text-[#18170f] sm:px-6">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
				<section className="grid w-full overflow-hidden rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] shadow-[0_24px_80px_rgba(24,23,15,0.12)] md:grid-cols-[0.95fr_1.05fr]">
					<div className="relative hidden min-h-[540px] overflow-hidden border-r border-[#d8d1c7] bg-[#ebe7df] p-8 md:block">
						<div className="absolute inset-x-0 top-0 h-16 border-b border-[#d8d1c7] bg-[#f7f5f2]/55" />
						<div className="absolute left-8 top-8 h-24 w-20 rotate-[-3deg] border border-[#d8d1c7] bg-[#f7f5f2] shadow-sm" />
						<div className="absolute right-10 top-24 h-36 w-28 rotate-[4deg] border border-[#d8d1c7] bg-[#f7f5f2] shadow-sm" />
						<div className="absolute bottom-24 left-12 h-44 w-32 rotate-[2deg] border border-[#d8d1c7] bg-[#f7f5f2] shadow-sm" />
						<div className="absolute bottom-10 right-8 h-28 w-24 rotate-[-5deg] border border-[#d8d1c7] bg-[#f7f5f2] shadow-sm" />
						<div className="relative z-10 flex h-full flex-col justify-between">
							<div>
								<p
									className="text-5xl font-light italic leading-none text-[#18170f]"
									style={{ fontFamily: "'Cormorant', Georgia, serif" }}
								>
									momento
								</p>
							</div>
							<div
								className="max-w-[17rem] border-t border-[#d8d1c7] pt-4 text-sm leading-6 text-[#6f675d]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								Private editing access for the photo archive.
							</div>
						</div>
					</div>

					<div className="flex min-h-[540px] items-center px-5 py-8 sm:px-10">
						<div className="mx-auto w-full max-w-sm space-y-8">
							<div className="space-y-3">
								<h1
									className="text-4xl font-light italic leading-none text-[#18170f]"
									style={{ fontFamily: "'Cormorant', Georgia, serif" }}
								>
									Sign in
								</h1>
							</div>

							{error && (
								<p className="rounded-sm border border-[#d9b8aa] bg-[#fff7f3] px-3 py-2 text-sm text-[#9a4d35]">
									Invalid email or password.
								</p>
							)}

							<form action={signIn} className="space-y-5">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-xs uppercase tracking-[0.14em] text-[#6f675d]"
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										Email
									</label>
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										className="h-11 w-full rounded-sm border border-[#d8d1c7] bg-[#fffdf9] px-3 text-sm text-[#18170f] outline-none transition placeholder:text-[#b5b0a8] focus:border-[#18170f] focus:ring-2 focus:ring-[#d8ccbd]/70"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="password"
										className="text-xs uppercase tracking-[0.14em] text-[#6f675d]"
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										Password
									</label>
									<input
										id="password"
										name="password"
										type="password"
										autoComplete="current-password"
										required
										className="h-11 w-full rounded-sm border border-[#d8d1c7] bg-[#fffdf9] px-3 text-sm text-[#18170f] outline-none transition placeholder:text-[#b5b0a8] focus:border-[#18170f] focus:ring-2 focus:ring-[#d8ccbd]/70"
									/>
								</div>

								<button
									type="submit"
									className="h-11 w-full rounded-sm bg-[#18170f] px-4 text-sm font-medium text-[#f7f5f2] transition-colors hover:bg-[#3b352e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7656] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
								>
									Sign in
								</button>
							</form>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
