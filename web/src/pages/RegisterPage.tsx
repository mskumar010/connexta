import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRegisterMutation } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setFirstTime } from '@/features/onboarding/onboardingSlice';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function RegisterPage() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [register, { isLoading, error }] = useRegisterMutation();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		displayName: '',
		confirmPassword: '',
	});
	const [formErrors, setFormErrors] = useState<{
		email?: string;
		password?: string;
		displayName?: string;
		confirmPassword?: string;
	}>({});

	const validate = () => {
		const errors: typeof formErrors = {};
		if (!formData.displayName) {
			errors.displayName = 'Display name is required';
		} else if (formData.displayName.length < 2) {
			errors.displayName = 'Display name must be at least 2 characters';
		}
		if (!formData.email) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = 'Email is invalid';
		}
		if (!formData.password) {
			errors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}
		if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		try {
			await register({
				email: formData.email,
				password: formData.password,
				displayName: formData.displayName,
			}).unwrap();

			toast.success('Account created successfully!');
			// Set first time flag and redirect to welcome
			dispatch(setFirstTime(true));
			navigate('/welcome');
		} catch (err: unknown) {
			console.error('Registration failed:', err);
			const errorMessage =
				err && typeof err === 'object' && 'data' in err &&
					(err.data as { message?: string }).message
					? (err.data as { message: string }).message
					: 'Registration failed. Please try again.';
			toast.error(errorMessage);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (formErrors[name as keyof typeof formErrors]) {
			setFormErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	return (
		<div
			className="flex min-h-screen items-center justify-center px-4"
			style={{ backgroundColor: 'var(--color-bg-primary)' }}
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-md space-y-8 rounded-2xl p-8 shadow-xl"
				style={{ backgroundColor: 'var(--color-bg-secondary)' }}
			>
				<div className="text-center">
					<h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>EchoRoom</h1>
					<p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Create a new account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{error && 'data' in error && (
						<div
							className="rounded-lg border p-3 text-sm"
							style={{
								backgroundColor: 'rgba(239, 68, 68, 0.1)',
								borderColor: 'rgba(239, 68, 68, 0.3)',
								color: '#f87171',
							}}
						>
							{'message' in (error.data as { message?: string })
								? (error.data as { message: string }).message
								: 'Registration failed. Please try again.'}
						</div>
					)}

					<Input
						label="Display Name"
						type="text"
						name="displayName"
						value={formData.displayName}
						onChange={handleChange}
						error={formErrors.displayName}
						placeholder="John Doe"
						autoComplete="name"
						required
					/>

					<Input
						label="Email"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						error={formErrors.email}
						placeholder="you@example.com"
						autoComplete="email"
						required
					/>

					<Input
						label="Password"
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						error={formErrors.password}
						placeholder="••••••••"
						autoComplete="new-password"
						required
					/>

					<Input
						label="Confirm Password"
						type="password"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						error={formErrors.confirmPassword}
						placeholder="••••••••"
						autoComplete="new-password"
						required
					/>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						isLoading={isLoading}
						className="w-full"
					>
						Create account
					</Button>
				</form>

				<div className="text-center text-sm">
					<span style={{ color: 'var(--color-text-tertiary)' }}>Already have an account? </span>
					<Link
						to="/login"
						className="font-medium transition-colors"
						style={{ color: '#818cf8' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = '#a5b4fc';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = '#818cf8';
						}}
					>
						Sign in
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
