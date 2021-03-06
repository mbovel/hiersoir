<?php require_once "../questions.php" ?>

<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8" />
	<title>Hier soir</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
	<link rel="stylesheet" href="https://unpkg.com/carbon-components/css/carbon-components.css" />
	<link rel="stylesheet" href="style.css" />
</head>

<body>
	<main>
		<h1>Questionnaire standard pour l'évaluation d'une relation intime entre deux êtres humains</h1>

		<form action="">

			<div class="bx--form-item">
				<label for="from" class=" bx--label">Rempli par:</label>
				<input id="from" type="mail" class="bx--text-input" name="from" placeholder="Prénom Nom">
			</div>
			<div class="bx--form-item">
				<label for="to" class="bx--label">À l'attention de:</label>
				<input id="to" type="mail" class="bx--text-input" name="to" placeholder="Prénom Nom">
			</div>

			<?php foreach (QUESTIONS as $qi => $question) : ?>
				<?php if ($question["type"] === "singleChoice") : ?>
					<fieldset class="bx--fieldset">
						<legend class="bx--label"><?= $question["label"] ?></legend>
						<div class="bx--radio-button-group">
							<?php foreach ($question["choices"] as $ci => $choice) : ?>
								<div class="bx--radio-button-wrapper">
									<input id="<?= $qi ?>-<?= $ci ?>" class="bx--radio-button" type="radio" value="<?= $ci ?>" name="<?= $qi ?>">
									<label class="bx--radio-button__label" for="<?= $qi ?>-<?= $ci ?>">
										<span class="bx--radio-button__appearance"></span>
										<span class="bx--radio-button__label-text"><?= $choice ?></span>
									</label>
								</div>
							<?php endforeach ?>
							<div class="bx--radio-button-wrapper">
								<input id="<?= $qi ?>-o" class="bx--radio-button other" type="radio" value="o" name="<?= $qi ?>" data-content="<?= $qi ?>-oc">
								<label class="bx--radio-button__label other" for="<?= $qi ?>-o">
									<span class="bx--radio-button__appearance"></span>
									<span class="bx--radio-button__label-text">
										autre: <input id="<?= $qi ?>-oc" type="text" class="bx--text-input bx--text-input--light other-content" name="<?= $qi ?>-oc" data-content-of="<?= $qi ?>-o" />
									</span>
								</label>
							</div>
						</div>
					</fieldset>
				<?php elseif ($question["type"] === "multipleChoice") : ?>
					<fieldset class="bx--fieldset">
						<legend class="bx--label"><?= $question["label"] ?></legend>
						<?php foreach ($question["choices"] as $ci => $choice) : ?>
							<div class="bx--form-item bx--checkbox-wrapper">
								<input id="<?= $qi ?>-<?= $ci ?>" class="bx--checkbox" type="checkbox" value="<?= $ci ?>" name="<?= $qi ?>">
								<label for="<?= $qi ?>-<?= $ci ?>" class="bx--checkbox-label"><?= $choice ?></label>
							</div>
						<?php endforeach ?>
						<div class="bx--form-item bx--checkbox-wrapper">
							<input id="<?= $qi ?>-o" class="bx--checkbox other" type="checkbox" value="o" name="<?= $qi ?>" data-content="<?= $qi ?>-oc">
							<label for="<?= $qi ?>-o" class="bx--checkbox-label">
								autre: <input type="text" id="<?= $qi ?>-oc" class="bx--text-input bx--text-input--light other-content" name="<?= $qi ?>-oc" data-content-of="<?= $qi ?>-o" />
							</label>
						</div>
					</fieldset>
				<?php endif ?>
			<?php endforeach ?>

			<div class="bx--form-item">
				<label for="text-area-2" class="bx--label">Commentaires</label>
				<div class="bx--text-area__wrapper">
					<textarea name="comments" id="text-area-2" class="bx--text-area bx--text-area--v2" rows="8" cols="50"></textarea>
				</div>
			</div>

			<div class="bx--form-item">
				<button class="bx--btn bx--btn--primary" type="button" id="share">Enregistrer et envoyer</button>
			</div>

			<div class="bx--form-item">
				<button class="bx--btn bx--btn--primary" type="button" id="restart">Remplir un nouveau formulaire</button>
			</div>
		</form>

		<footer>
			<p>Ce formulaire est à l'origine un élément fictif de la nouvelle <a href="https://salejeune.com/on-secrit/">«On s'écrit»</a>, mais n'hésitez pas à en faire usage dans la vraie vie !</p>

			<p>Les données du formulaire sont enregistrées uniquement lors d'un clic sur le bouton «Enregistrer et envoyer» ci-dessus. Elles sont alors chiffrées <a href="https://fr.wikipedia.org/wiki/Chiffrement_de_bout_en_bout">bout à bout</a> grâce au standard <a href="https://fr.wikipedia.org/wiki/Advanced_Encryption_Standard">AES-256</a>; elles ne peuvent donc être lues par personne — même pas l'hébérgeur — sans le lien unique qui contient la clef de chiffrement.</p>

			<p>Le code est disponible librement ici: <a href="https://github.com/mbovel/hiersoir">github.com/mbovel/hiersoir</a>.</p>

			<p>Ce site est hébérgé chez <a href="https://www.infomaniak.com/">Infomaniak</a> et a été développé par <a href="https://www.facebook.com/mbovel">Matthieu Bovel</a>.</p>

			<p>Un grand merci aux personnes qui ont participé à l'élaboration de ce formulaire par leurs brillantes suggestions!</p>
		</footer>

		<div data-modal id="modal-shared" class="bx--modal" role="dialog" aria-modal="true" aria-labelledby="modal-shared-label" aria-describedby="modal-shared-heading" tabindex="-1">
			<div class="bx--modal-container">
				<div class="bx--modal-header">
					<p class="bx--modal-header__heading bx--type-beta" id="modal-shared-heading">Votre formulaire a bien été enregistré</p>
					<button class="bx--modal-close" type="button" data-modal-close aria-label="close modal" data-modal-primary-focus>
						<svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--modal-close__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
							<path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3 4.7 12 8 8.7 11.3 12 12 11.3 8.7 8z"></path>
						</svg>
					</button>
				</div>

				<!-- Note: Modals with content that scrolls, at any viewport, requires `tabindex="0"` on the `bx--modal-content` element -->
				<div class="bx--modal-content bx--modal-content--with-form">
					<p>Vous pouvez le partager en envoyant le lien suivant à la personne concernée:</p>

					<div class="bx--form-item">
						<input id="shared-link" type="url" readonly class="bx--text-input" value="https://www.example.com" placeholder="Optional placeholder text" data-modal-primary-focus>
					</div>

					<p>Ce lien est valable une semaine, son contenu sera ensuite automatiquement effacé.</p>
				</div>

			</div>
			<!-- Note: focusable span allows for focus wrap feature within Modals -->
			<span tabindex="0"></span>
		</div>

		<script src="https://www.google.com/recaptcha/api.js?render=6LcEduMUAAAAAB8eJXou15nBU_8PL_xDcFeuW2gh"></script>
		<script src="index.js"></script>
	</main>

</body>

</html>