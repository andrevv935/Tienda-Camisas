import { useState } from 'react'
import TangramCanvas from '../../components/tangram/TangramCanvas.jsx'
import { useLoadingScreen } from '../../hook/loadingScreen/loadingScreen.jsx'

function wait(milliseconds) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, milliseconds)
	})
}

export default function LoadingScreenSettings() {
	const {
		isEnabled,
		isSystemLoading,
		setEnabled,
		withLoading,
		networkLoadingCount,
		manualLoadingCount,
	} = useLoadingScreen()
	const [isSimulating, setIsSimulating] = useState(false)

	async function handleSimulateLoading() {
		setIsSimulating(true)
		try {
			await withLoading(() => wait(2200))
		} finally {
			setIsSimulating(false)
		}
	}

	return (
		<section className='mt-4 w-full rounded bg-secondary-light/30 p-4 md:p-6'>
			<h1 className='title text-3xl font-bold'>Pantalla de carga</h1>
			<p className='paragraph mt-2 max-w-4xl'>
				Activa o desactiva el tangrama global durante cargas del sistema.
			</p>

			<div className='mt-4 flex flex-col gap-3 rounded border border-text-light/15 bg-bg-light/60 p-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<p className='subtitle text-xl'>Estado global del tangrama</p>
				</div>

				<label className='flex select-none items-center gap-3'>
					<span className='paragraph text-sm'>Activado</span>
					<input
						type='checkbox'
						checked={isEnabled}
						onChange={(event) => setEnabled(event.target.checked)}
						className='h-5 w-5 accent-accent-light'
					/>
				</label>
			</div>

			<div className='mt-6 rounded border border-text-light/20 bg-[#f7efe5] p-4'>
				<p className='subtitle mb-3 text-2xl'>Preview del tangrama</p>
				<TangramCanvas className='h-90 w-full overflow-hidden rounded-xl' clearColor='#f7efe5' />
			</div>
		</section>
	)
}
